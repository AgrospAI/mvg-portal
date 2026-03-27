import Modal from '@components/@shared/Modal'
import classNames from 'classnames'
import { FinalizeMetadataRequestModal } from '../../../Modal/FinalizeMetadataRequestModal/index'
import { useConsentRowActions } from '../ConsentRowActions.hooks'
import styles from './Buttons.module.css'
import Key from '@images/key.svg'
import AssetProvider from '@context/Asset'

const cx = classNames.bind(styles)

const Content = ({
  request
}: Readonly<{
  request: ExtendedMetadataRequest
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
      <AssetProvider did={request.dataset.did}>
        <FinalizeMetadataRequestModal request={request} />
      </AssetProvider>
    </Modal.Content>
  </>
)

export const FinalizeConsent = () => {
  const { request } = useConsentRowActions()

  return <Content request={request} />
}
