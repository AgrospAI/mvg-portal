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
import { isOutgoing, isPending, isSolicited } from '@utils/consents/utils'
import { useAccount } from 'wagmi'

export const useUserConsentsAmount = () => {
  const { address } = useAccount()
  return useSuspenseQuery({
    queryKey: ['profile-consents', address],
    queryFn: async ({ signal }) => getUserConsents(address, signal)
  })
}

const useUserConsents = (direction: ConsentDirection, queryKey: string) => {
  const { address } = useAccount()
  return useSuspenseQuery({
    queryKey: [queryKey, address],
    queryFn: async ({ signal }) =>
      getUserConsentsDirection(address, direction, signal)
  })
}

export const useUserIncomingConsents = () => {
  return useUserConsents('Incoming', 'user-incoming-consents')
}

export const useUserOutgoingConsents = () => {
  return useUserConsents('Outgoing', 'user-outgoing-consents')
}

export const useUserSolicitedConsents = () => {
  return useUserConsents('Solicited', 'user-solicited-consents')
}

export const useCreateConsentResponse = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  interface Mutation {
    consentId: number
    reason: string
    permitted: PossibleRequests
  }

  return useMutation({
    mutationFn: async ({ consentId, reason, permitted }: Mutation) =>
      createConsentResponse(consentId, reason, permitted),

    onSuccess: (newConsent, { consentId, reason, permitted }) => {
      // Update the list of incoming consents
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

      // Decrease the amount of pending consents
      queryClient.setQueryData(
        ['profile-consents', address],
        (oldData: UserConsentsData) => ({
          ...oldData,
          incoming_pending_consents: oldData.incoming_pending_consents - 1
        })
      )
    }
  })
}

export const useCreateAssetConsent = () => {
  const { address } = useAccount()

  interface Mutation {
    datasetDid: string
    algorithmDid: string
    request: PossibleRequests
    reason?: string
  }

  return useMutation({
    mutationFn: async ({
      datasetDid,
      algorithmDid,
      request,
      reason
    }: Mutation) =>
      createConsent(address, datasetDid, algorithmDid, request, reason)
  })
}

export const useDeleteConsent = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

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

      if (isOutgoing(consent) || isSolicited(consent)) {
        const other = isOutgoing(consent) ? 'solicited' : 'outgoing'
        const direction = `user-${other}-consents`

        queryClient.setQueryData(
          [direction, address],
          (oldData: Consent[] = []) =>
            oldData.filter((c) => c.id !== consent.id)
        )

        if (isPending(consent)) {
          // Decrease the amount of pending consents
          queryClient.setQueryData(
            ['profile-consents', address],
            (oldData: UserConsentsData) => ({
              ...oldData,
              outgoing_pending_consents: oldData.outgoing_pending_consents - 1,
              solicited_pending_consents: oldData.solicited_pending_consents - 1
            })
          )
        }
      }
    }
  })
}

export const useDeleteConsentResponse = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

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

export const useHealthcheck = () =>
  useSuspenseQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 0
  })
