import { Consent } from '@utils/consents/types'
import { isIncoming, isOutgoing, isPending } from '@utils/consents/utils'
import styles from './ConsentRowActions.module.css'
import DeleteButton from './DeleteButton'
import InspectButton from './InspectButton'

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
      {isPending(consent) && isOutgoing(consent) && (
        <DeleteButton consent={consent} />
      )}
    </div>
  )
}
