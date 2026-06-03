import Modal from '@components/@shared/Modal'
import Cross from '@images/cross.svg'
import classNames from 'classnames'
import { DeleteMetadataRequestModal } from '../../../Modal/DeleteMetadataRequestModal'
import { useConsentRowActions } from '../ConsentRowActions.hooks'
import styles from './Buttons.module.css'

const cx = classNames.bind(styles)

const Content = ({
  request
}: Readonly<{
  request: MetadataRequest
}>) => (
  <>
    <Modal.Trigger name={`${request.id}_delete`}>
      <button
        className={cx(styles.button, styles.deleteButton)}
        title="Delete"
        aria-label="Delete Request"
        type="button"
      >
        Delete Request <Cross />
      </button>
    </Modal.Trigger>
    <Modal.Content name={`${request.id}_delete`}>
      <DeleteMetadataRequestModal request={request} />
    </Modal.Content>
  </>
)

export const DeleteConsent = () => {
  const { request } = useConsentRowActions()

  return <Content request={request} />
}
