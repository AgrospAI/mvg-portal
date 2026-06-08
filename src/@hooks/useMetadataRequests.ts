import {
  getMetadataRequestVotesById,
  getMetadataSubRequestsById
} from '@context/UserMetadataRequests/_queries'
import { queryOptions, UseQueryOptions } from '@tanstack/react-query'
import { getAsset } from '@utils/aquarius'
import { cancelToken } from '@utils/axios'
import { fetchData, getQueryContext } from '@utils/subgraph'

export const getAssetQueryOptions = (did: string) =>
  queryOptions({
    queryKey: ['asset', did],
    queryFn: async ({ signal }) => getAsset(did, cancelToken(signal))
  })

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
