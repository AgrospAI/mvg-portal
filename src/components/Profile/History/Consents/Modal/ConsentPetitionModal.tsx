import Modal from '@components/@shared/atoms/Modal'
import { useConsentsPetition } from '@context/Profile/ConsentsPetitionProvider'

export default function ConsentPetitionModal() {
  const { isStartPetition, setIsStartPetition } = useConsentsPetition()

  return (
    <Modal
      title="Consent Petition Modal"
      onToggleModal={() => setIsStartPetition(!isStartPetition)}
      isOpen={isStartPetition}
    >
      asdsad
    </Modal>
  )
}
