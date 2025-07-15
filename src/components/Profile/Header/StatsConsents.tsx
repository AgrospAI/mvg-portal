import { useUserConsentsAmount } from '@hooks/useUserConsents'
import NumberUnit from './NumberUnit'

function StatsConsents() {
  const {
    data: {
      incoming_pending_consents: incomingPendingConsents,
      outgoing_pending_consents: outgoingPendingConsents,
      solicited_pending_consents: solicitedPendingConsents
    }
  } = useUserConsentsAmount()

  return (
    <>
      <NumberUnit
        label="Incoming Pending Consents"
        value={incomingPendingConsents}
      />
      <NumberUnit
        label="Outgoing Pending Consents"
        value={outgoingPendingConsents}
      />
      <NumberUnit
        label="Solicited Pending Consents"
        value={solicitedPendingConsents}
      />
    </>
  )
}

export default StatsConsents
