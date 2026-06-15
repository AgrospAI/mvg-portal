import { metadataRequestVotesOptions } from '@hooks/useMetadataRequests'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { getUserVote } from '@utils/consents/utils'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAccount, useNetwork } from 'wagmi'

export interface FormResponse {
  id: number
  reason: string
  permissions: {
    permitted: boolean
    requestType: number
  }[]
}

const getFormResponse = (requestId: number) => {
  const response = localStorage.getItem('cachedConsentResponse')
  if (!response) return null

  try {
    const parsed = JSON.parse(response) as FormResponse
    return parsed.id === requestId ? parsed : null
  } catch (error) {
    console.warn('Could not parse cached response.', error)
    return null
  }
}

export const mapVoteToFormResponse = (
  vote: MetadataRequestVote,
  requestId: number
): FormResponse | undefined => {
  if (!vote) return undefined

  const permissions: FormResponse['permissions'] = []
  for (let i = 0; i < 5; i++) {
    const mask = 1 << i
    permissions.push({
      permitted: (vote.inFavourBitmap & mask) !== 0,
      requestType: i
    })
  }

  return {
    id: requestId,
    reason: vote.data,
    permissions
  }
}

export const useMetadataRequestResponse = (requestId: number) => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const queryClient = useQueryClient()

  const { data: votes } = useSuspenseQuery(
    metadataRequestVotesOptions(requestId, chain.id)
  )
  const userVote = getUserVote(votes, address)
  const [cachedResponse, setCachedResponse] = useState(
    mapVoteToFormResponse(userVote, requestId) ?? {}
  )
  const [debouncedResponse] = useDebounce(cachedResponse, 1000)

  useEffect(() => {
    localStorage.setItem(
      'cachedConsentResponse',
      JSON.stringify(debouncedResponse)
    )
    console.log('Updated response', debouncedResponse)
  }, [debouncedResponse])

  useEffect(() => {
    if (userVote) {
      setCachedResponse(mapVoteToFormResponse(userVote, requestId))
    }
  }, [userVote, requestId])

  return {
    cachedResponse,
    setCachedResponse,
    userVote,
    votes,
    refreshVotes: async () => {
      await queryClient.refetchQueries({
        queryKey: metadataRequestVotesOptions(requestId, chain.id).queryKey
      })
    }
  }
}
