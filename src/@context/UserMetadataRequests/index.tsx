import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo
} from 'react'
import { useAccount, useNetwork } from 'wagmi'

import {
  MetadataRequestFilterByStateOptions,
  MetadataRequestFilterByTypeOptions
} from '@/@types/MetadataRequest'
import { useMetadataRequestFilter } from '@context/MetadataRequestFilter'
import {
  getMetadataRequests,
  getUserStats
} from '@context/UserMetadataRequests/_queries'
import {
  QueryFunctionContext,
  useQueryClient,
  useSuspenseQueries
} from '@tanstack/react-query'
import { getAssetsNames } from '@utils/aquarius'
import { cancelToken } from '@utils/axios'
import { makeDid } from '@utils/consents/utils'
import { fetchData, getQueryContext } from '@utils/subgraph'
import { CancelToken } from 'axios'

interface UserMetadataRequestsContextValue {
  requests: ExtendedMetadataRequest[]
  pendingCount: number
  totalCount: number
  refreshRequests: () => Promise<void>
}

const UserMetadataRequestsContext = createContext(
  {} as UserMetadataRequestsContextValue
)

const providerChainsCache = new Map<string, Promise<number[]>>()

function UserMetadataRequestsProvider({
  children
}: Readonly<PropsWithChildren>) {
  const { chain } = useNetwork()
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const { sort, filters, showPurgatory, showExpired } =
    useMetadataRequestFilter()

  interface DidCandidate {
    chainId: number
    did: string
  }

  interface RequestDiscovery {
    dataset: DidCandidate[]
    algorithm: DidCandidate[]
  }

  const getSupportedChains = useCallback(
    async (providerUrl: string): Promise<number[]> => {
      if (!providerChainsCache.has(providerUrl)) {
        providerChainsCache.set(
          providerUrl,
          fetch(providerUrl)
            .then((r) => r.json())
            .then((j) => Object.values(j.chainIds).map(Number))
        )
      }

      return providerChainsCache.get(providerUrl)!
    },
    []
  )

  const discoverRequestDids = useCallback(
    async (request: MetadataRequest): Promise<RequestDiscovery> => {
      const supportedChains = await getSupportedChains(
        request.datasetAddress.providerUrl
      )

      const dataset = await Promise.all(
        supportedChains.map(async (chainId) => ({
          chainId,
          did: await makeDid(chainId, request.datasetAddress.id)
        }))
      )

      const algorithm = await Promise.all(
        supportedChains.map(async (chainId) => ({
          chainId,
          did: await makeDid(chainId, request.algorithmAddress.id)
        }))
      )

      return { dataset, algorithm }
    },
    [getSupportedChains]
  )

  function resolveEntry(
    entries: { chainId: number; did: string }[],
    assetNames: Record<string, string>
  ) {
    const valid = entries.find((e) => assetNames[e.did])

    if (!valid) return null

    return {
      did: valid.did,
      chainId: valid.chainId,
      name: assetNames[valid.did]
    }
  }

  const fetchAndExtend = useCallback(
    async (
      query,
      variables,
      cancelToken: CancelToken
    ): Promise<ExtendedMetadataRequest[]> => {
      const res = await fetchData(query, variables, getQueryContext(chain.id))

      const list = (res.data?.metadataRequests ||
        res.metadataRequests ||
        []) as MetadataRequest[]

      if (!list.length) return []

      // 1. Discover candidate DIDs for all requests
      const discoveries = await Promise.all(
        list.map((request) => discoverRequestDids(request))
      )

      // 2. Collect all possible DIDs
      const allDids = discoveries.flatMap((d) => [
        ...d.dataset.map((e) => e.did),
        ...d.algorithm.map((e) => e.did)
      ])

      const uniqueDids = [...new Set(allDids)]

      // 3. Fetch asset names in ONE request
      const assetNames = await getAssetsNames(uniqueDids, cancelToken)

      // 4. Resolve dataset + algorithm for each request
      const extended: ExtendedMetadataRequest[] = list.map((req, i) => {
        const discovery = discoveries[i]

        return {
          ...req,
          dataset: resolveEntry(discovery.dataset, assetNames),
          algorithm: resolveEntry(discovery.algorithm, assetNames)
        }
      })

      return extended
    },
    [chain?.id, discoverRequestDids]
  )

  const stableWhereClause = useMemo(() => {
    if (!address) return null
    const userAddr = address.toLowerCase()
    const where: Record<string, any> = {}

    if (filters.state.length > 0) {
      const statusMap: Record<string, number> = {
        [MetadataRequestFilterByStateOptions.Pending]: 0,
        [MetadataRequestFilterByStateOptions.Approved]: 2,
        [MetadataRequestFilterByStateOptions.Resolved]: 3,
        [MetadataRequestFilterByStateOptions.Rejected]: 4
      }
      const statusValues = filters.state
        .map((s) => statusMap[s])
        .filter((v) => v !== undefined)
      if (statusValues.length === 1) where.status = statusValues[0]
      else where.status_in = statusValues
    } else if (!showPurgatory) {
      where.status_not = 1
    }

    if (filters.direction.length === 1) {
      if (
        filters.direction.includes(MetadataRequestFilterByTypeOptions.Incoming)
      ) {
        where.datasetAddress_ = { owner: userAddr }
      } else {
        where.requester = userAddr
      }
    }

    return where
  }, [address, filters, showPurgatory])

  const requestOrderClause = useMemo(() => {
    if (!sort?.sort || !sort?.sortOrder) return {}

    return {
      orderBy: sort.sort,
      orderDirection: sort.sortOrder
    }
  }, [sort])

  const [{ data: requests }, { data: stats }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          'metadata-requests',
          address,
          chain?.id,
          stableWhereClause,
          requestOrderClause,
          showExpired
        ],
        queryFn: async ({ signal }: QueryFunctionContext) => {
          if (!address || !chain?.id || !stableWhereClause) return []
          const userAddr = address.toLowerCase()
          const directions = filters?.direction || []
          const ctrl = cancelToken(signal)

          // Scenario 1: Both or None selected (The "OR" workaround)
          if (directions.length !== 1) {
            const [outgoing, incoming] = await Promise.all([
              fetchAndExtend(
                getMetadataRequests,
                {
                  where: { ...stableWhereClause, requester: userAddr },
                  ...requestOrderClause
                },
                ctrl
              ),
              fetchAndExtend(
                getMetadataRequests,
                {
                  where: {
                    ...stableWhereClause,
                    datasetAddress_: { owner: userAddr }
                  },
                  ...requestOrderClause
                },
                ctrl
              )
            ])

            return [...outgoing, ...incoming]
          }

          // Scenario 2: Explicit filter (Incoming OR Outgoing)
          // The stableWhereClause already contains the correct specific filter
          return fetchAndExtend(
            getMetadataRequests,
            { where: stableWhereClause, ...requestOrderClause },
            ctrl
          )
        },
        staleTime: 180_000
      },
      {
        queryKey: ['metadata-requests-stats', address, chain?.id],
        queryFn: async () => {
          if (!address || !chain?.id || !stableWhereClause) return {}
          return fetchData(
            getUserStats,
            {
              id: address.toLowerCase()
            },
            getQueryContext(chain.id)
          )
        },
        staleTime: 180_000,
        select: (data) => data?.data?.userCounter
      }
    ]
  })

  const contextValue = useMemo(
    () => ({
      requests: requests ?? [],
      pendingCount: stats?.pendingCount || 0,
      totalCount: stats?.totalCount || 0,
      refreshRequests: async () =>
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: ['metadata-requests']
          }),
          queryClient.refetchQueries({
            queryKey: ['metadata-requests-stats']
          })
        ])
    }),
    [requests, stats, queryClient]
  )

  return (
    <UserMetadataRequestsContext.Provider value={contextValue}>
      {children}
    </UserMetadataRequestsContext.Provider>
  )
}

const useMetadataRequests = () => {
  const ctx = useContext(UserMetadataRequestsContext)
  if (!ctx) {
    throw new Error(
      'useMetadataRequests used without UserMetadataRequestsContext'
    )
  }
  return ctx
}

export {
  useMetadataRequests,
  UserMetadataRequestsContext,
  UserMetadataRequestsProvider
}
export default UserMetadataRequestsProvider
