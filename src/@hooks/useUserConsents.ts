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
  ConsentState,
  PossibleRequests
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

const updateStatus = (
  id: number,
  data: Consent[],
  status: ConsentState = 'Pending'
) => data.map((c) => (c.id === id ? { ...c, status } : c))

export const useCreateConsentResponse = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  type Variables = {
    consentId: number
    reason: string
    permitted: PossibleRequests
  }

  return useMutation({
    mutationFn: async ({ consentId, reason, permitted }: Variables) =>
      createConsentResponse(consentId, reason, permitted),

    onSuccess: (newConsent, { consentId }) => {
      if (!address) return

      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[]) =>
          updateStatus(consentId, oldData, newConsent.status)
      )
    }
  })
}

export const useCreateAssetConsent = () => {
  const { address } = useAccount()

  type Variables = {
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
    }: Variables) =>
      createConsent(address, datasetDid, algorithmDid, request, reason)
  })
}

export const useDeleteConsent = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  type Variables = {
    consent: Consent
  }

  return useMutation({
    mutationFn: async ({ consent }: Variables) => deleteConsent(consent.id),

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
      }

      if (isPending(consent)) {
        await queryClient.invalidateQueries({
          queryKey: ['profile-consents', address]
        })
      }
    }
  })
}

export const useDeleteConsentResponse = () => {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({ consent }: { consent: Consent }) =>
      deleteConsentResponse(consent.id),

    onSuccess: (_, { consent }) => {
      if (!address) return

      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[]) => updateStatus(consent.id, oldData)
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
