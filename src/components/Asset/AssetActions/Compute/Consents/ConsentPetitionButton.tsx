import Button from '@components/@shared/atoms/Button'
import ConsentPetitionModal from '@components/Profile/History/Consents/Modal/ConsentPetitionModal'
import { useModal } from '@context/Modal'
import { useHealthcheck } from '@hooks/useUserConsents'
import styles from './ConsentPetitionButton.module.css'
import QueryBoundary from '@components/@shared/QueryBoundary'

interface Props {
  asset: AssetExtended
}

export default function ConsentPetitionButton({ asset }: Props) {
  const { setCurrentModal, openModal } = useModal()
  useHealthcheck()

  return (
    <span className={styles.requestButtonContainer}>
      Your {asset.metadata.algorithm ? 'dataset' : 'algorithm'} is not listed?
      <Button
        style="text"
        size="small"
        title="Start consent petition"
        type="button"
        onClick={() => {
          setCurrentModal(
            <QueryBoundary>
              <ConsentPetitionModal asset={asset} />
            </QueryBoundary>
          )
          openModal()
        }}
        className={styles.requestButton}
      >
        Make petition
      </Button>
    </span>
  )
}
