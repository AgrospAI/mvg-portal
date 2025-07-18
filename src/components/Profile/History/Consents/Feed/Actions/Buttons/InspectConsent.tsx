import Loader from '@components/@shared/atoms/Loader'
import Modal from '@components/@shared/Modal'
import Info from '@images/info.svg'
import { Consent } from '@utils/consents/types'
import { Suspense } from 'react'
import InspectConsentsModal from '../../../Modal/InspectConsentsModal'
import styles from './Buttons.module.css'

interface InspectConsentProps {
  consent: Consent
}

function InspectConsent({ consent }: InspectConsentProps) {
  return (
    <Modal>
      <Modal.Trigger>
        <span className={styles.item} title="Inspect" aria-label="Inspect">
          <Info />
        </span>
      </Modal.Trigger>
      <Modal.Content title="Inspect petition">
        <Suspense fallback={<Loader />}>
          <InspectConsentsModal consent={consent} />
        </Suspense>
      </Modal.Content>
    </Modal>
  )
}

export default InspectConsent
