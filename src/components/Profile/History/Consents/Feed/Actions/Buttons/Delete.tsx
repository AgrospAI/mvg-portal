import Cross from '@images/cross.svg'
import { Consent } from '@utils/consents/types'
import { useConsentRowActions } from '../ConsentRowActions'
import styles from './Buttons.module.css'

interface DeleteButtonProps {
  action: ({ consent }: { consent: Consent }) => void
  condition: (consent: Consent) => boolean
  children: string
}

function DeleteButton({ action, condition, children }: DeleteButtonProps) {
  const { consent } = useConsentRowActions()

  if (!condition(consent)) return <></>

  return (
    <div
      className={styles.item}
      aria-label={`Delete ${children.toLowerCase()}`}
      title={`Delete ${children.toLowerCase()}`}
      onClick={() => action({ consent })}
    >
      <Cross />
    </div>
  )
}

export default DeleteButton
