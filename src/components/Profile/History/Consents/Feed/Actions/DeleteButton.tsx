import Cross from '@images/cross.svg'
import { useConsentRowActions } from './ConsentRowActions.hooks'
import styles from './ConsentRowActions.module.css'
import { Consent } from '@utils/consents/types'

interface DeleteButtonProps {
  consent: Consent
}

function DeleteButton({ consent }: DeleteButtonProps) {
  const { handleDelete } = useConsentRowActions(consent)

  return (
    <div
      className={styles.item}
      aria-label="Delete response"
      title="Delete response"
      onClick={handleDelete}
    >
      <Cross />
    </div>
  )
}

export default DeleteButton
