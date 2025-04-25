import { useConsents } from '@context/Profile/ConsentsProvider'
import styles from './Actions.module.css'
import Button from '@components/@shared/atoms/Button'

export default function ConsentModalActions() {
  const { updateSelected, setSelected, setIsInspect } = useConsents()

  return (
    <div className={styles.modalActions}>
      <Button
        size="small"
        className={styles.reject}
        onClick={() => {
          updateSelected(ConsentState.PENDING)
          setSelected(undefined)
          setIsInspect(false)
        }}
      >
        Reject
      </Button>
      <Button
        size="small"
        className={styles.confirm}
        onClick={() => {
          updateSelected(ConsentState.ACCEPTED)
          setSelected(undefined)
          setIsInspect(false)
        }}
      >
        Accept
      </Button>
    </div>
  )
}
