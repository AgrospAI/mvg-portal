import Info from '@images/info.svg'
import styles from './ConsentRowActions.module.css'
import { useConsentRowActions } from './ConsentRowActions.hooks'
import { Consent } from '@utils/consents/types'

interface InspectButtonProps {
  consent: Consent
}

function InspectButton({ consent }: InspectButtonProps) {
  const { handleInspect } = useConsentRowActions(consent)

  return (
    <div
      className={styles.item}
      aria-label="Inspect"
      title="Inspect"
      onClick={handleInspect}
    >
      <Info />
    </div>
  )
}

export default InspectButton
