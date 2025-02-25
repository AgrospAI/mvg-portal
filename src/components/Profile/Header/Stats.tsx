import { ReactElement } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'
import { useUserConsents } from '@context/Profile/ConsentsProvider'

export default function Stats(): ReactElement {
  const { assetsTotal, sales } = useProfile()
  const {
    incomingPending: incomingPendingConsents,
    outgoingPending: outgoingPendingConsents
  } = useUserConsents()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={typeof sales !== 'number' || sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <NumberUnit
        label="Incoming Pending Consents"
        value={incomingPendingConsents ?? -1}
      />
      <NumberUnit
        label="Outgoing Pending Consents"
        value={outgoingPendingConsents ?? -1}
      />
    </div>
  )
}
