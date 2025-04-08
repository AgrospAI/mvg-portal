import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/atoms/Modal'
import Time from '@components/@shared/atoms/Time'
import ConsentStateBadge from '@components/Profile/History/Consents/StateBadge'
import { ConsentState, getConsentHistory } from '@utils/consentsUser'
import { useEffect, useState } from 'react'
import { useConsents } from './ConsentsProvider'
import styles from './ReasonModal.module.css'

export default function ReasonModal() {
  const {
    selected,
    setSelected,
    updateSelected,
    isInspect,
    setIsInspect,
    setIsLoading
  } = useConsents()

  const [history, setHistory] = useState<ConsentHistory[]>()

  useEffect(() => {
    if (!selected || !isInspect) return

    const fetchHistory = async (consent: Consent) => {
      setIsLoading(true)

      getConsentHistory(consent)
        .then(setHistory)
        .finally(() => setIsLoading(false))
    }

    fetchHistory(selected)
  }, [selected, isInspect, setIsLoading])

  return (
    <Modal
      title={''}
      onToggleModal={() => setIsInspect(!isInspect)}
      isOpen={isInspect}
      className={styles.modal}
    >
      <div className={styles.modalHeader}>
        {selected && <AssetListTitle did={selected.dataset.did} />}
        <span className={styles.modalState}>
          Current state:{' '}
          {selected && <ConsentStateBadge state={selected.state} />}
        </span>
      </div>
      <div className={styles.modalContent}>
        {selected?.reason ?? 'No reason provided'}
      </div>
      <div className={styles.historyTitle}>
        History{' '}
        <span className={styles.count}>
          {history?.length ?? 0} event{history?.length !== 1 && 's'}
        </span>
      </div>
      <div className={styles.modalHistory}>
        {history?.map((history, index) => (
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
