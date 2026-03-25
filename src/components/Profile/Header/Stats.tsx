import { useProfile } from '@context/Profile'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { ReactElement } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'

export default function Stats(): ReactElement {
  const { assetsTotal, sales } = useProfile()
  const { totalCount, pendingCount } = useMetadataRequests()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={typeof sales !== 'number' || sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <NumberUnit label="Incoming Pending Consents" value={pendingCount} />
      <NumberUnit label="Requested Pending Consents" value={totalCount} />
    </div>
  )
}
