import {
  useUserIncomingConsents,
  useUserOutgoingConsents,
  useUserSolicitedConsents
} from '@hooks/useUserConsents'
import { useQueryClient } from '@tanstack/react-query'

import { Consent } from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'

export const useConsentsFeed = () => {
  const { address } = useAccount()

  const { data: incoming, isLoading: isLoadingIncoming } =
    useUserIncomingConsents()
  const { data: outgoing, isLoading: isLoadingOutgoing } =
    useUserOutgoingConsents()
  const { data: solicited, isLoading: isLoadingSolicited } =
    useUserSolicitedConsents()

  const [isOnlyPending, setIsOnlyPending] = useState(false)

  const filterPending = (consents: Consent[]) => consents.filter(isPending)

  const filteredIncoming = isOnlyPending
    ? filterPending(incoming || [])
    : incoming || []

  const filteredOutgoing = isOnlyPending
    ? filterPending(outgoing || [])
    : outgoing || []

  const filteredSolicited = isOnlyPending
    ? filterPending(solicited || [])
    : solicited || []

  const queryClient = useQueryClient()
  const refreshConsents = useCallback(() => {
    ;[
      ['user-incoming-consents'],
      ['user-outgoing-consents'],
      ['user-solicited-consents']
    ].forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey, exact: false })
    )
  }, [queryClient])

  return {
    address,
    incoming: filteredIncoming,
    isLoadingIncoming,
    outgoing: filteredOutgoing,
    isLoadingOutgoing,
    solicited: filteredSolicited,
    isLoadingSolicited,
    isOnlyPending,
    setIsOnlyPending,
    refreshConsents
  }
}
