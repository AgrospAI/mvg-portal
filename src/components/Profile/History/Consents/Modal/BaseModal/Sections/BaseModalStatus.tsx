import { ConsentState } from '@utils/consents/types'
import ConsentStateBadge from '../../../Feed/StateBadge'
import styles from './BaseModalStatus.module.css'
import { useBaseModal } from '../BaseModal'

interface BaseModalStatusProps {
  status: ConsentState
}

function BaseModalStatus({ status }: BaseModalStatusProps) {
  useBaseModal()

  return (
    <span className={styles.container}>
      Resolution: <ConsentStateBadge status={status} />
    </span>
  )
}

export default BaseModalStatus
