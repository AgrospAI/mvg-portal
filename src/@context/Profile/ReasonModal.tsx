import Modal from '@components/@shared/atoms/Modal'
import React from 'react'
import styles from './ReasonModal.module.css'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'

interface Props {
  consentPetition?: Consent
  disabled: boolean
  hasReasonInspect: boolean
  setHasReasonInspect: (hasReasonInspect: boolean) => void
  onAcceptConfirm: () => void
  onRejectConfirm: () => void
}

export default function ReasonModal({
  consentPetition,
  disabled,
  hasReasonInspect,
  setHasReasonInspect,
  onAcceptConfirm,
  onRejectConfirm
}: Props) {
  return (
    <Modal
      title="Consent request reason"
      onToggleModal={() => setHasReasonInspect(!hasReasonInspect)}
      isOpen={hasReasonInspect}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        {consentPetition?.reason ?? 'No reason provided'}
      </div>

      <div className={styles.modalActions}>
        <Button
          size="small"
          className={styles.modalCancelBtn}
          onClick={() => setHasReasonInspect(false)}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          size="small"
          className={styles.modalConfirmBtn}
          onClick={() => onAcceptConfirm()}
          disabled={disabled}
        >
          {disabled ? <Loader message={`Loading...`} /> : `Confirm`}
        </Button>
        <Button
          size="small"
          className={styles.modalRejectBtn}
          onClick={() => onRejectConfirm()}
          disabled={disabled}
        >
          {disabled ? <Loader message={`Loading...`} /> : `Reject`}
        </Button>
      </div>
    </Modal>
  )
}
