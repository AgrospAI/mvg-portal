import Modal from '@components/@shared/atoms/Modal'
import React, { useEffect, useState } from 'react'
import styles from './ReasonModal.module.css'
import Button from '@components/@shared/atoms/Button'
import ConsentStateBadge from '@components/Profile/History/Consents/StateBadge'
import axios from 'axios'
import { getAssetsNames } from '@utils/aquarius'
import { useMarketMetadata } from '@context/MarketMetadata'
import Time from '@components/@shared/atoms/Time'
import { useConsents } from './ConsentsProvider'
import { ConsentState } from '@utils/consentsUser'

export default function ReasonModal() {
  const { appConfig } = useMarketMetadata()
  const [assetTitle, setAssetTitle] = useState<string>()

  const { selected, setSelected, updateSelected, isInspect, setIsInspect } =
    useConsents()

  useEffect(() => {
    const source = axios.CancelToken.source()

    async function getAssetName() {
      getAssetsNames([selected.asset], source.token).then((title) =>
        setAssetTitle(title[selected.asset])
      )
    }

    selected?.asset && getAssetName()

    return () => {
      source.cancel()
    }
  }, [isInspect, appConfig.metadataCacheUri])

  return (
    <Modal
      title={assetTitle}
      onToggleModal={() => setIsInspect(!isInspect)}
      isOpen={isInspect}
      className={styles.modal}
    >
      <span className={styles.modalState}>
        Current state:{' '}
        {selected && <ConsentStateBadge state={selected.state} />}
      </span>
      <div className={styles.modalContent}>
        {selected?.reason ?? 'No reason provided'}
      </div>
      <div className={styles.modalHistory}>
        {selected?.history.map((history, index) => (
          <span className={styles.modalHistoryItem} key={index}>
            <Time date={history.updated_at} relative isUnix />{' '}
            <ConsentStateBadge state={history.state} />
          </span>
        ))}
      </div>
      <div className={styles.modalActions}>
        <Button
          size="small"
          className={styles.modalRejectBtn}
          onClick={() => {
            updateSelected(ConsentState.REJECTED)
            setSelected(undefined)
            setIsInspect(false)
          }}
        >
          Reject
        </Button>
        <Button
          size="small"
          className={styles.modalConfirmBtn}
          onClick={() => {
            updateSelected(ConsentState.ACCEPTED)
            setSelected(undefined)
            setIsInspect(false)
          }}
        >
          Accept
        </Button>
      </div>
    </Modal>
  )
}
