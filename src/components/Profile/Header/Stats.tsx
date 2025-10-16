import { ReactElement } from 'react'
import NumberUnit from './NumberUnit'
import { useStats } from './Stats.hooks'
import styles from './Stats.module.css'

export default function Stats(): ReactElement {
  const {
    assetsTotal,
    sales,
    incomingPendingConsents,
    outgoingPendingConsents,
    solicitedPendingConsents
  } = useStats()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={typeof sales !== 'number' || sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
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
    </div>
  )
}
