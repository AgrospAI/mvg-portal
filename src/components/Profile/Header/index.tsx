import { ReactElement } from 'react'
import Account from './Account'
import styles from './index.module.css'
import Stats from './Stats'

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  return (
    <div className={styles.grid}>
      <div className={styles.header}>
        <Account accountId={accountId} />
        <Stats />
      </div>
    </div>
  )
}
