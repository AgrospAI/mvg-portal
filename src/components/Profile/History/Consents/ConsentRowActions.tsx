import { useConsents } from '@context/Profile/ConsentsProvider'
import Info from '@images/info.svg'
import {
  ConsentDirection,
  ConsentState,
  ListConsent
} from '@utils/consentsUser'
import styles from './ConsentRowActions.module.css'

export default function ConsentRowActions({
  consent
}: {
  consent: ListConsent
}) {
  const { setSelected, setIsInspect, setIsInteractiveInspect } = useConsents()

  return (
    <div className={styles.actions}>
      <div
        className={styles.item}
        aria-label="Inspect"
        title="Inspect"
        onClick={() => {
          console.log(consent.status)
          setSelected(consent)
          setIsInspect(true)
          setIsInteractiveInspect(
            consent.type === ConsentDirection.INCOMING &&
              consent.status === null
          )
        }}
      >
        <Info />
      </div>
    </div>
  )
}
