import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/Modal'
import ConsentPetitionModal from '@components/Profile/History/Consents/Modal/ConsentPetitionModal'
import { useHealthcheck } from '@hooks/useUserConsents'
import styles from './ConsentPetitionButton.module.css'

interface ConsentPetitionButtonProps {
  asset: AssetExtended
}

export default function ConsentPetitionButton({
  asset
}: ConsentPetitionButtonProps) {
  useHealthcheck()

  return (
    <span className={styles.requestButtonContainer}>
      Your {asset.metadata.algorithm ? 'dataset' : 'algorithm'} is not listed
      <Modal>
        <Modal.Trigger>
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
        <Modal.Content title="Make Petition">
          <ConsentPetitionModal asset={asset} />
        </Modal.Content>
      </Modal>
    </span>
  )
}
