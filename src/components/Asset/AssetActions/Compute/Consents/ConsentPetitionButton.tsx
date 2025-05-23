import Button from '@components/@shared/atoms/Button'
import styles from './ConsentPetitionButton.module.css'
import { useModal } from '@context/Modal'
import ConsentPetitionModal from '@components/Profile/History/Consents/Modal/ConsentPetitionModal'

interface Props {
  asset: AssetExtended
}

export default function ConsentPetitionButton({ asset }: Props) {
  const { setCurrentModal, openModal } = useModal()

  return (
    <div>
      <span className={styles.requestButtonContainer}>
        Your {asset.metadata.algorithm ? 'dataset' : 'algorithm'} is not listed?
        <Button
          style="text"
          size="small"
          title="Start consent petition"
          type="button"
          onClick={() => {
            setCurrentModal(<ConsentPetitionModal asset={asset} />)
            openModal()
          }}
          className={styles.requestButton}
        >
          Make petition
        </Button>
      </span>
    </div>
  )
}
