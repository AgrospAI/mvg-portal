import {
  getMetadataRequestVotesById,
  getMetadataSubRequestsById
} from '@context/UserMetadataRequests/_queries'
import { Asset } from '@oceanprotocol/lib'
import {
  QueryFunctionContext,
  queryOptions,
  UseQueryOptions,
  useSuspenseQueries
} from '@tanstack/react-query'
import { getAsset } from '@utils/aquarius'
import { cancelToken } from '@utils/axios'
import { fetchData, getQueryContext } from '@utils/subgraph'
import { useCallback } from 'react'

const STORAGE_KEY = 'currentConsent'

export const useCurrentMetadataRequest = () => {
  const setCurrentRequest = useCallback(
    (consent: ExtendedMetadataRequest | null) => {
      if (!consent) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
      }
    },
    []
  )

  const getCurrentRequest = (): ExtendedMetadataRequest | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as MetadataRequest) : null
    } catch {
      return null
    }
  }

  return {
    currentRequest: getCurrentRequest(),
    setCurrentRequest
  }
}

export const getAssetQueryOptions = (did: string) =>
  queryOptions({
    queryKey: ['asset', did],
    queryFn: async ({ signal }) => getAsset(did, cancelToken(signal))
  })

export const useGetAssets = (dids: string[]): Asset[] => {
  const results = useSuspenseQueries({
    queries: dids.map((did) => ({
      queryFn: async ({ signal }: QueryFunctionContext) =>
        getAsset(did, cancelToken(signal))
    }))
  })

  return results.map((result) => {
    return result.data ?? null
  })
}

const filterUniqueTypes = (
  requests: MetadataSubRequest[]
): MetadataSubRequest[] => {
  if (!requests) return []

  const seenTypes = new Set<MetadataSubRequest['requestType']>()

  return requests.filter((request) => {
    if (seenTypes.has(request.requestType)) {
      return false
    }
    seenTypes.add(request.requestType)
    return true
  })
}

export const subRequestsQueryOptions = (requestId: number, chainId: number) =>
  queryOptions({
    queryKey: ['subrequests', requestId],
    queryFn: async () => {
      const res = await fetchData(
        getMetadataSubRequestsById,
        { id: requestId },
        getQueryContext(chainId)
      )

      return res.data?.metadataRequests[0]?.subRequests || []
    },
    select: filterUniqueTypes
  })

export const metadataRequestVotesOptions = (
  requestId: number,
  chainId: number
): UseQueryOptions<unknown, unknown, MetadataRequestVote[]> =>
  queryOptions({
    queryKey: ['votes', requestId],
    queryFn: async () => {
      const res = await fetchData(
        getMetadataRequestVotesById,
        { id: requestId },
        getQueryContext(chainId)
      )

      return res?.data?.metadataRequest?.votes || []
    }
  })
