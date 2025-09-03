import { ReactElement } from 'react'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import Button from '../../@shared/atoms/Button'
import Account from './Account'
import styles from './index.module.css'
import Stats from './Stats'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import Refresh from '@images/refresh.svg'

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { autoWalletAddress } = useAutomation()

  return (
    <div className={styles.grid}>
      <div className={styles.header}>
        <Account accountId={accountId} />
        <Stats />
      </div>
      {autoWalletAddress && autoWalletAddress !== accountId && (
        <div className={styles.automation}>
          <Button style="text" to={`/profile/${autoWalletAddress}`}>
            View Automation Account
          </Button>
        </div>
      )}
    </div>
  )
}
