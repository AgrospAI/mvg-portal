import { useConsents } from '@context/Profile/ConsentsProvider'
import Info from '@images/info.svg'
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
          setSelected(consent)
          setIsInspect(true)
          setIsInteractiveInspect(consent.type !== 'outgoing')
        }}
      >
        <Info />
      </div>
    </div>
  )
}
