import { useProfile } from '@context/Profile'
import { useUserConsentsAmount } from '@hooks/useUserConsents'

export const useStats = () => {
  const { assetsTotal, sales } = useProfile()
  const { data } = useUserConsentsAmount()

  return {
    assetsTotal,
    sales,
    incomingPendingConsents: data?.incoming_pending_consents ?? 0,
    outgoingPendingConsents: data?.outgoing_pending_consents ?? 0,
    solicitedPendingConsents: data?.solicited_pending_consents ?? 0
  }
}
