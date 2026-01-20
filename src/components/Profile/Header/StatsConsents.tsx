import { useUserConsentsAmount } from '@hooks/useUserConsents'
import NumberUnit from './NumberUnit'

interface Props {
  accountId: string
}

function StatsConsents({ accountId }: Readonly<Props>) {
  const {
    data: {
      incoming_pending_consents: incomingPendingConsents,
      outgoing_pending_consents: outgoingPendingConsents
    }
  } = useUserConsentsAmount(accountId)

  return (
    <>
      <NumberUnit
        label="Incoming Pending Consents"
        value={incomingPendingConsents ?? 0}
      />
      <NumberUnit
        label="Outgoing Pending Consents"
        value={outgoingPendingConsents ?? 0}
      />
    </>
  )
}

export default StatsConsents
