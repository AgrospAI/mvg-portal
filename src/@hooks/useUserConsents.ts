import { Asset } from '@oceanprotocol/lib'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Consent,
  ConsentDirection,
  createConsent,
  getUserConsents,
  getUserConsentsAmount
} from '@utils/consents/ConsentApi'
import {
  createConsentResponse,
  deleteConsentResponse
} from '@utils/consents/ConsentResponseApi'
import { ConsentState, PossibleRequests } from '@utils/consents/types'
import { useAccount } from 'wagmi'

function useUserConsents(direction: ConsentDirection, queryKey: string) {
  const { address } = useAccount()

  return useQuery({
    queryKey: [queryKey, address],
    queryFn: () => getUserConsents(address, direction),
    placeholderData: (prev) => prev || [],
    enabled: !!address
  })
}

export const useUserIncomingConsents = () => {
  return useUserConsents(ConsentDirection.INCOMING, 'user-incoming-consents')
}

export const useUserOutgoingConsents = () => {
  return useUserConsents(ConsentDirection.OUTGOING, 'user-outgoing-consents')
}

export const useUserSolicitedConsents = () => {
  return useUserConsents(ConsentDirection.SOLICITED, 'user-solicited-consents')
}

export function useUserConsentsAmount() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ['profile-consents', address],
    queryFn: () => getUserConsentsAmount(address),
    enabled: !!address
  })
}

const updateStatus = (
  id: number,
  data: Consent[],
  status: ConsentState = ConsentState.PENDING
) => data.map((c) => (c.id === id ? { ...c, status } : c))

export function useCreateConsentResponse() {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({
      consent,
      reason,
      permitted
    }: {
      consent: Consent
      reason: string
      permitted: PossibleRequests | null
    }) => createConsentResponse(consent, reason, permitted),

    onSuccess: (newConsent, { consent }) => {
      if (!address) return

      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[]) =>
          updateStatus(consent.id, oldData, newConsent.status)
      )
    }
  })
}

interface CreateAssetConsent {
  dataset: Asset
  algorithm: Asset
  request: PossibleRequests
  reason?: string
}

export function useCreateAssetConsent() {
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({ dataset, algorithm, request, reason }: CreateAssetConsent) =>
      createConsent(address, dataset.id, algorithm.id, request, reason)
  })
}

export function useDeleteConsentResponse() {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({ consent }: { consent: Consent }) =>
      deleteConsentResponse(consent),

    onSuccess: (_, { consent }) => {
      if (!address) return

      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[]) => updateStatus(consent.id, oldData)
      )
    }
  })
}
