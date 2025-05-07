import { useConsents } from '@context/Profile/ConsentsProvider'
import Cross from '@images/cross.svg'
import Info from '@images/info.svg'
import {
  ConsentDirection,
  deleteConsentResponse,
  ListConsent
} from '@utils/consentsUser'
import styles from './ConsentRowActions.module.css'

export default function ConsentRowActions({
  consent
}: {
  consent: ListConsent
}) {
  const {
    incoming,
    setIncoming,
    setSelected,
    setIsInspect,
    setIsInteractiveInspect
  } = useConsents()

  return (
    <div className={styles.actions}>
      <div
        className={styles.item}
        aria-label="Inspect"
        title="Inspect"
        onClick={() => {
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
      {consent.status && consent.type === ConsentDirection.INCOMING && (
        <div
          className={styles.item}
          aria-label="Delete response"
          title="Delete response"
          onClick={() => {
            deleteConsentResponse(consent).then(() => {
              setIncoming(
                incoming.map((inc) =>
                  inc.url === consent.url ? { ...consent, status: null } : inc
                )
              )
            })
          }}
        >
          <Cross />
        </div>
      )}
    </div>
  )
}
