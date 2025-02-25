import Modal from '@components/@shared/atoms/Modal'
import React from 'react'
import styles from './ReasonModal.module.css'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'

interface Props {
  consentPetition?: Consent
  disabled: boolean
  hasReasonInspect: boolean
  disableReasonInspect: () => void
  onAcceptConfirm: () => void
  onRejectConfirm: () => void
}

export default function ReasonModal({
  consentPetition,
  disabled,
  hasReasonInspect,
  disableReasonInspect,
  onAcceptConfirm,
  onRejectConfirm
}: Props) {
  return (
    <Modal
      title="Consent request reason"
      onToggleModal={disableReasonInspect}
      isOpen={hasReasonInspect}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        {consentPetition?.reason ?? 'No reason provided'}
      </div>

      <div className={styles.modalActions}>
        <Button
          size="small"
          className={styles.modalRejectBtn}
          onClick={() => {
            onRejectConfirm()
            disableReasonInspect()
          }}
          disabled={disabled}
        >
          {disabled ? <Loader message={`Loading...`} /> : `Reject`}
        </Button>
        <Button
          size="small"
          className={styles.modalConfirmBtn}
          onClick={() => {
            onAcceptConfirm()
            disableReasonInspect()
          }}
          disabled={disabled}
        >
          {disabled ? <Loader message={`Loading...`} /> : `Approve`}
        </Button>
      </div>
    </Modal>
  )
}
