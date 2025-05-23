import styles from './ConsentRowActions.module.css'
import InspectButton from './InspectButton'
import DeleteButton from './DeleteButton'
import { Consent } from '@utils/consents/types'
import { isIncoming, isPending } from '@utils/consents/utils'

interface Props {
  consent: Consent
}

export default function ConsentRowActions({ consent }: Props) {
  return (
    <div className={styles.actions}>
      <InspectButton consent={consent} />
      {!isPending(consent) && isIncoming(consent) && (
        <DeleteButton consent={consent} />
      )}
    </div>
  )
}
