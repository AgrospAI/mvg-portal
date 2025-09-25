import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query'
import {
  createConsent,
  createConsentResponse,
  deleteConsent,
  deleteConsentResponse,
  getHealth,
  getUserConsents,
  getUserConsentsDirection
} from '@utils/consents/api'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import { useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useConsentUpdater } from './useConsentUpdater'
import { useUserConsentsToken } from './useUserConsentsToken'
import { toast } from 'react-toastify'

export const useUserConsentsAmount = () => {
  const { address } = useAccount()
  return useSuspenseQuery({
    queryKey: ['profile-consents', address],
    queryFn: async ({ signal }) => getUserConsents(address, signal)
  })
}

const useUserConsents = (direction: ConsentDirection, queryKey: string) => {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const query = useSuspenseQuery({
    queryKey: [queryKey, address],
    queryFn: async ({ signal }) =>
      getUserConsentsDirection(address, direction, signal)
  })

  // Check if the fetched data differs from the stored pendings, if so, refetch user stats
  useEffect(() => {
    const amounts = (queryClient.getQueryData(['profile-consents', address]) ??
      {}) as UserConsentsData

    let hasChanged = false

    switch (direction) {
      case 'Incoming':
        hasChanged =
          amounts.incoming_pending_consents !==
          query.data.filter(isPending).length
        break
      case 'Outgoing':
        hasChanged =
          amounts.outgoing_pending_consents !==
          query.data.filter(isPending).length
        break
    }

    if (hasChanged) {
      queryClient.invalidateQueries({
        queryKey: ['profile-consents', address]
      })
    }
  }, [address, direction, query.data, queryClient])

  return query
}

export const useUserIncomingConsents = () => {
  return useUserConsents('Incoming', 'user-incoming-consents')
}

export const useUserOutgoingConsents = () => {
  return useUserConsents('Outgoing', 'user-outgoing-consents')
}

export const useDeleteConsentResponse = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  useUserConsentsToken()

  interface Mutation {
    consentId: number
  }

  return useMutation({
    mutationFn: async ({ consentId }: Mutation) =>
      deleteConsentResponse(consentId),

    onSuccess: (_data, { consentId }) => {
      // Set the consent back to "no-response" state
      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[] = []) => {
          return oldData.map((consent) => {
            if (consent.id !== consentId) return consent

            return {
              ...consent,
              status: 'Pending',
              response: null
            }
          })
        }
      )

      // Increase the amount of pending consents
      queryClient.setQueryData(
        ['profile-consents', address],
        (oldData: UserConsentsData) => ({
          ...oldData,
          incoming_pending_consents: oldData.incoming_pending_consents + 1
        })
      )
    }
  })
}

export const useCreateConsentResponse = (asset: AssetExtended) => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const { newUpdater } = useConsentUpdater()
  const { mutateAsync: deleteConsentResponse } = useDeleteConsentResponse()
  useUserConsentsToken()

  interface Mutation {
    consentId: number
    reason: string
    permitted: PossibleRequests
  }

  return useMutation({
    mutationFn: async ({ consentId, reason, permitted }: Mutation) =>
      createConsentResponse(consentId, reason, permitted),

    onSuccess: async (newConsent, { consentId, reason, permitted }) => {
      // 1. Update the list of incoming consents
      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[] = []) => {
          return oldData.map((consent) => {
            if (consent.id !== consentId) return consent

            return {
              ...consent,
              status: newConsent.status,
              response: {
                consent: newConsent.url,
                status: newConsent.status,
                reason,
                permitted,
                last_updated_at: 0
              }
            }
          })
        }
      )

      // 2. Decrease the amount of pending consents
      queryClient.setQueryData(
        ['profile-consents', address],
        (oldData: UserConsentsData) => ({
          ...oldData,
          incoming_pending_consents: oldData.incoming_pending_consents - 1
        })
      )

      const callback = async (result: boolean | string): Promise<void> => {
        let response = 'Reverting consent response'
        const res = typeof result
        if (res === 'boolean' && result) return
        else if (res === 'string') response = response.concat(` ${result}`)

        return await deleteConsentResponse({ consentId }).then(() => {
          toast.warn(response)
          console.log(response)
        })
      }

      // 3. Update the blockchain asset with the changes
      await newUpdater(newConsent).apply(asset).then(callback).catch(callback)
    }
  })
}

export const useCreateAssetConsent = () => {
  const { address } = useAccount()
  useUserConsentsToken()

  interface Mutation {
    chainId: number
    datasetDid: string
    algorithmDid: string
    request: PossibleRequests
    reason?: string
  }

  return useMutation({
    mutationFn: async ({
      chainId,
      datasetDid,
      algorithmDid,
      request,
      reason
    }: Mutation) =>
      createConsent(address, chainId, datasetDid, algorithmDid, request, reason)
  })
}

export const useDeleteConsent = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()
  useUserConsentsToken()

  interface Mutation {
    consent: Consent
  }

  return useMutation({
    mutationFn: async ({ consent }: Mutation) => deleteConsent(consent.id),

    onSuccess: async (_, { consent }) => {
      if (!address) return

      const direction = `user-${consent.direction.toLowerCase()}-consents`
      queryClient.setQueryData(
        [direction, address],
        (oldData: Consent[] = []) => oldData.filter((c) => c.id !== consent.id)
      )

      if (isPending(consent)) {
        // Decrease the amount of pending consents
        queryClient.setQueryData(
          ['profile-consents', address],
          (oldData: UserConsentsData) => ({
            ...oldData,
            outgoing_pending_consents: oldData.outgoing_pending_consents - 1
          })
        )
      }
    }
  })
}

export const useHealthcheck = () =>
  useSuspenseQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 0
  })
