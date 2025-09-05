import { useDeleteConsent } from '@hooks/useUserConsents'
import DeleteButton from './Delete'
import { useCallback, useState } from 'react'
import Modal from '@components/@shared/atoms/Modal'
import { Consent } from '@utils/consents/types'
import styles from './DeleteConsent.module.css'
import Button from '@components/@shared/atoms/Button'

function DeleteConsent() {
  const { mutateAsync: deleteConsent } = useDeleteConsent()

  const [passedConsent, setPassedConsent] = useState<Consent | null>(null)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)

  const toggleCallback = useCallback((consent: Consent) => {
    setPassedConsent(consent)
    setIsConfirmationModalOpen(true)
  }, [])

  return (
    <>
      <Modal
        title={'Confirm deletion'}
        onToggleModal={() => setIsConfirmationModalOpen(false)}
        isOpen={isConfirmationModalOpen}
        className={styles.confirmationModal}
        style={{
          overlay: {
            backgroundColor: 'transparent'
          }
        }}
      >
        <div className={styles.actions}>
          <Button
            className={styles.cancelButton}
            onClick={() => {
              setIsConfirmationModalOpen(false)
              setPassedConsent(null)
            }}
          >
            Cancel
          </Button>
          <Button
            className={styles.deleteButton}
            onClick={() => deleteConsent({ consent: passedConsent })}
          >
            Delete
          </Button>
        </div>
      </Modal>
      <DeleteButton action={toggleCallback}>consent</DeleteButton>
    </>
  )
}

export default DeleteConsent
