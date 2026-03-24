import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/Modal'
import { CreateMetadataRequestModal } from '@components/Profile/History/Consents/Modal/CreateMetadataRequestModal'
import { useAccount } from 'wagmi'
import styles from './ConsentPetitionButton.module.css'

interface ConsentPetitionButtonProps {
  asset: AssetExtended
}

export default function ConsentPetitionButton({
  asset
}: ConsentPetitionButtonProps) {
  const { address } = useAccount()

  if (!address) {
    return <></>
  }

  return (
    <span className={styles.requestButtonContainer}>
      Your algorithm is not listed?
      <Modal>
        <Modal.Trigger name={'0'}>
          <Button
            style="text"
            size="small"
            title="Start consent petition"
            type="button"
            className={styles.requestButton}
          >
            Make petition
          </Button>
        </Modal.Trigger>
        <Modal.Content name={'0'}>
          <CreateMetadataRequestModal asset={asset} />
        </Modal.Content>
      </Modal>
    </span>
  )
}
