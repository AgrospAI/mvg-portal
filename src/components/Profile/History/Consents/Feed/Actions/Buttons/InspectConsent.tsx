import Loader from '@components/@shared/atoms/Loader'
import Modal from '@components/@shared/Modal'
import { useCurrentConsent } from '@hooks/useCurrentConsent'
import Info from '@images/info.svg'
import { Consent } from '@utils/consents/types'
import { Suspense } from 'react'
import InspectConsentsModal from '../../../Modal/InspectConsentsModal'
import styles from './Buttons.module.css'

interface InspectConsentProps {
  consent: Consent
}

function InspectConsent({ consent }: InspectConsentProps) {
  const { setCurrentConsent } = useCurrentConsent()

  return (
    <>
      <Modal.Trigger
        name={String(consent.id)}
        onClick={() => setCurrentConsent(consent)}
      >
        <button
          className={styles.button}
          title="Inspect"
          aria-label="Inspect Consent"
        >
          Inspect <Info />
        </button>
      </Modal.Trigger>
      <Modal.Content name={String(consent.id)}>
        <Suspense fallback={<Loader />}>
          <InspectConsentsModal />
        </Suspense>
      </Modal.Content>
    </>
  )
}

export default InspectConsent
