import Modal from '@components/@shared/Modal'
import Info from '@images/info.svg'
import { InspectMetadataRequestModal } from '../../../Modal/InspectConsentsModal'
import styles from './Buttons.module.css'

const Content = ({
  request,
  isRequested
}: Readonly<{
  request: MetadataRequest
  isRequested?: boolean
}>) => (
  <>
    <Modal.Trigger name={String(request.id)}>
      <button
        className={styles.button}
        title="Inspect"
        aria-label="Inspect Consent"
        type="button"
      >
        Inspect <Info />
      </button>
    </Modal.Trigger>
    <Modal.Content name={String(request.id)}>
      <InspectMetadataRequestModal
        request={request}
        isRequested={isRequested}
      />
    </Modal.Content>
  </>
)

export const InspectModal = ({
  isRequested,
  request
}: Readonly<{
  request: MetadataRequest
  isRequested?: boolean
}>) => <Content request={request} isRequested={isRequested} />
