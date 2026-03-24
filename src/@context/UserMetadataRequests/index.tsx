import { createContext, ReactNode, useCallback, useContext } from 'react'
import { Address, useNetwork } from 'wagmi'

import {
  getMetadataRequestsByRequester,
  getMetadataRequestsForOwnedAssets
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
  requested: ExtendedMetadataRequest[]
  incoming: ExtendedMetadataRequest[]
  pendingRequested: number
  pendingIncoming: number
  refreshRequested: () => void
  refreshIncoming: () => void
}

const UserMetadataRequestsContext = createContext(
  {} as UserMetadataRequestsContextValue
)

interface UserMetadataRequestsProviderProps {
  address: Address
  children: ReactNode
}

const providerChainsCache = new Map<string, Promise<number[]>>()

function UserMetadataRequestsProvider({
  address,
  children
}: Readonly<UserMetadataRequestsProviderProps>) {
  const { chain } = useNetwork()
  const queryClient = useQueryClient()

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

      console.log('Fetched data', list)

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
      console.log('Possible DIDS', uniqueDids)

      // 3. Fetch asset names in ONE request
      const assetNames = await getAssetsNames(uniqueDids, cancelToken)
      console.log('Asset names', assetNames)

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
    [chain.id, discoverRequestDids]
  )

  const [{ data: requested }, { data: incoming }] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['metadata-requested', address, chain?.id],
        queryFn: async ({ signal }: QueryFunctionContext) =>
          fetchAndExtend(
            getMetadataRequestsByRequester,
            {
              user: address.toLowerCase()
            },
            cancelToken(signal)
          ),
        staleTime: 150_000
      },
      {
        queryKey: ['metadata-incoming', address, chain?.id],
        queryFn: async ({ signal }: QueryFunctionContext) =>
          fetchAndExtend(
            getMetadataRequestsForOwnedAssets,
            {
              user: address.toLowerCase()
            },
            cancelToken(signal)
          ),
        staleTime: 150_000
      }
    ]
  })

  return (
    <UserMetadataRequestsContext.Provider
      value={{
        incoming,
        requested,
        pendingRequested: requested.filter((rq) => rq.status === 0).length || 0,
        pendingIncoming: incoming.filter((rq) => rq.status === 0).length || 0,
        refreshRequested: () =>
          queryClient.invalidateQueries({
            queryKey: ['metadata-requested', address, chain?.id]
          }),
        refreshIncoming: () =>
          queryClient.invalidateQueries({
            queryKey: ['metadata-incoming', address, chain?.id]
          })
      }}
    >
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
