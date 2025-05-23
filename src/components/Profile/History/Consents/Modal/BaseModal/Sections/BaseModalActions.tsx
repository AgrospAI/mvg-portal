import Button from '@components/@shared/atoms/Button'
import styles from './BaseModalActions.module.css'
import { useBaseModal } from '../BaseModal'

interface BaseModalActionsProps {
  handleAccept?: () => void
  handleReject?: () => void
  acceptText?: string
  rejectText?: string
  isLoading?: boolean
}

function BaseModalActions({
  handleAccept,
  handleReject,
  acceptText,
  rejectText,
  isLoading
}: BaseModalActionsProps) {
  useBaseModal()

  return (
    <div className={styles.actions}>
      {(handleReject || rejectText) && (
        <Button
          size="small"
          name="action"
          className={styles.reject}
          onClick={handleReject}
          type="submit"
          disabled={isLoading}
        >
          {rejectText}
        </Button>
      )}
      {(handleAccept || acceptText) && (
        <Button
          size="small"
          name="action"
          className={styles.confirm}
          onClick={handleAccept}
          type="submit"
          disabled={isLoading}
        >
          {acceptText}
        </Button>
      )}
    </div>
  )
}

export default BaseModalActions
