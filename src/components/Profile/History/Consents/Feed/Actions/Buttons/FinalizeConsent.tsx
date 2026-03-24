import Modal from '@components/@shared/Modal'
import classNames from 'classnames'
import { FinalizeMetadataRequestModal } from '../../../Modal/FinalizeMetadataRequestModal/index'
import { useConsentRowActions } from '../ConsentRowActions.hooks'
import styles from './Buttons.module.css'
import Key from '@images/key.svg'

const cx = classNames.bind(styles)

const Content = ({
  request
}: Readonly<{
  request: MetadataRequest
}>) => (
  <>
    <Modal.Trigger name={`${request.id}_finalize`}>
      <button
        className={cx(styles.button, styles.finalizeButton)}
        title="Apply"
        aria-label="Apply Request"
        type="button"
      >
        Apply Request <Key />
      </button>
    </Modal.Trigger>
    <Modal.Content name={`${request.id}_finalize`}>
      <FinalizeMetadataRequestModal request={request} />
    </Modal.Content>
  </>
)

export const FinalizeConsent = () => {
  const { request } = useConsentRowActions()

  return <Content request={request} />
}
