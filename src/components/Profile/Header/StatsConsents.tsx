import { useMetadataRequests } from '@context/UserMetadataRequests'
import NumberUnit from './NumberUnit'

function StatsConsents() {
  const { pendingIncoming, pendingRequested } = useMetadataRequests()

  return (
    <>
      <NumberUnit label="Incoming Pending Consents" value={pendingIncoming} />
      <NumberUnit label="Requested Pending Consents" value={pendingRequested} />
    </>
  )
}

export default StatsConsents
