import { useModal } from '@context/Modal'
import Info from '@images/info.svg'
import { isIncoming, isPending } from '@utils/consents/utils'
import { useCallback } from 'react'
import InspectConsentModal from '../../../Modal/InspectConsentModal'
import { useConsentRowActions } from '../ConsentRowActions'
import styles from './Buttons.module.css'

function InspectConsent() {
  const { consent } = useConsentRowActions()
  const { setSelected, setIsInteractive, openModal, setCurrentModal } =
    useModal()

  const inspect = useCallback(() => {
    setCurrentModal(<InspectConsentModal consent={consent} />)
    setSelected(consent)
    setIsInteractive(isPending(consent) && isIncoming(consent))
    openModal()
  }, [consent, openModal, setCurrentModal, setIsInteractive, setSelected])

  return (
    <div
      className={styles.item}
      aria-label="Inspect"
      title="Inspect"
      onClick={inspect}
    >
      <Info />
    </div>
  )
}

export default InspectConsent
