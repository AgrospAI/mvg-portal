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
    <Modal>
      <Modal.Trigger onClick={() => setCurrentConsent(consent)}>
        <button
          className={styles.button}
          title="Inspect"
          aria-label="Inspect Consent"
        >
          Inspect <Info />
        </button>
      </Modal.Trigger>
      <Modal.Content>
        <Suspense fallback={<Loader />}>
          <InspectConsentsModal />
        </Suspense>
      </Modal.Content>
    </Modal>
  )
}

export default InspectConsent
