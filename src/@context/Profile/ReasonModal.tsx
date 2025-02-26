import Modal from '@components/@shared/atoms/Modal'
import React, { useEffect, useState } from 'react'
import styles from './ReasonModal.module.css'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import ConsentStateBadge from '@components/Profile/History/Consents/StateBadge'
import axios from 'axios'
import { getAssetsNames } from '@utils/aquarius'
import { useMarketMetadata } from '@context/MarketMetadata'

interface Props {
  consentPetition?: Consent
  disabled: boolean
  inspect: boolean
  disableReasonInspect: () => void
  onAcceptConfirm: () => void
  onRejectConfirm: () => void
}

export default function ReasonModal({
  consentPetition,
  disabled,
  inspect,
  disableReasonInspect,
  onAcceptConfirm,
  onRejectConfirm
}: Props) {
  const { appConfig } = useMarketMetadata()
  const [assetTitle, setAssetTitle] = useState<string>()

  useEffect(() => {
    const source = axios.CancelToken.source()

    async function getAssetName() {
      getAssetsNames([consentPetition.asset], source.token).then((title) =>
        setAssetTitle(title[consentPetition.asset])
      )
    }

    consentPetition?.asset && getAssetName()

    return () => {
      source.cancel()
    }
  }, [inspect, appConfig.metadataCacheUri])

  return (
    <Modal
      title={assetTitle}
      onToggleModal={disableReasonInspect}
      isOpen={inspect}
      className={styles.modal}
    >
      <span className={styles.modalState}>
        Current state:{' '}
        {consentPetition && <ConsentStateBadge state={consentPetition.state} />}
      </span>
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
          {disabled ? <Loader message={`Loading...`} /> : `Accept`}
        </Button>
      </div>
    </Modal>
  )
}
