import { Asset } from '@oceanprotocol/lib'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Consent,
  ConsentDirection,
  ConsentState,
  ConsentsUserData,
  PossibleRequests
} from '@utils/consents/types'
import axios from 'axios'
import { useAccount } from 'wagmi'
import { removeItemFromArray } from '../@utils/index'
import { isOutgoing, isPending, isSolicited } from '@utils/consents/utils'

function useUserConsents(direction: ConsentDirection, queryKey: string) {
  const { address } = useAccount()

  return useQuery({
    queryKey: [queryKey, address],
    queryFn: () =>
      axios
        .get('/api/get-user-consents', {
          params: {
            address: `${address}`,
            direction: `${direction}`
          }
        })
        .then(({ data }) => data),
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
    queryFn: () =>
      axios
        .get('/api/get-user-consents-amount', { params: { address } })
        .then(({ data }) => data),
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
    mutationFn: async ({
      consent,
      reason,
      permitted
    }: {
      consent: Consent
      reason: string
      permitted?: PossibleRequests
    }) =>
      axios
        .post('/api/create-consent-response', {
          consentId: consent.id,
          reason,
          permitted
        })
        .then(({ data }) => data),
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
      axios
        .post('/api/create-consent', {
          address,
          datasetDid: dataset.id,
          algorithmDid: algorithm.id,
          request: JSON.stringify(request),
          reason
        })
        .then(({ data }) => data)
  })
}

export function useDeleteConsent() {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({ consent }: { consent: Consent }) =>
      axios.delete('/api/delete-consent', { data: { consentId: consent.id } }),
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
          queryKey: ['profile-consents', address],
          exact: true
        })
      }
    }
  })
}

export function useDeleteConsentResponse() {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  return useMutation({
    mutationFn: ({ consent }: { consent: Consent }) =>
      axios
        .delete('/api/delete-consent-response', {
          data: { consentId: consent.id }
        })
        .then(({ data }) => data),
    onSuccess: (_, { consent }) => {
      if (!address) return

      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[]) => updateStatus(consent.id, oldData)
      )
    }
  })
}
