import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/atoms/Modal'
import Time from '@components/@shared/atoms/Time'
import {
  ConsentState,
  extractDidFromUrl,
  getAsset,
  getConsentDetailed
} from '@utils/consentsUser'
import { useConsents } from './ConsentsProvider'
import styles from './ReasonModal.module.css'
import { useEffect, useState } from 'react'
import { getAssetsNames } from '@utils/aquarius'
import axios from 'axios'
import Publisher from '@components/@shared/Publisher'
import Link from 'next/link'
import ConsentRequest from '@components/Profile/History/Consents/ConsentRequest'

export default function ReasonModal() {
  const { selected, setSelected, updateSelected, isInspect, setIsInspect } =
    useConsents()

  const [algorithmName, setAlgorithmName] = useState<string>()
  const [datasetName, setDatasetName] = useState<string>()

  const [algorithm, setAlgorithm] = useState<ConsentsAsset>()
  const [dataset, setDataset] = useState<ConsentsAsset>()

  const [consent, setConsent] = useState<Consent>()

  useEffect(() => {
    if (!selected) return

    const source = axios.CancelToken.source()
    async function getAssetName(did: string) {
      const title = await getAssetsNames([did], source.token)
      return title[did]
    }

    getAssetName(extractDidFromUrl(selected.dataset)).then(setDatasetName)
    getAssetName(extractDidFromUrl(selected.algorithm)).then(setAlgorithmName)

    getAsset(selected.algorithm).then(setAlgorithm)
    getAsset(selected.dataset).then(setDataset)

    getConsentDetailed(selected.url).then(setConsent)

    return () => {
      source.cancel()
    }
  }, [selected])

  return (
    <>
      {selected && (
        <Modal
          title=""
          onToggleModal={() => setIsInspect(!isInspect)}
          isOpen={isInspect}
          className={styles.modal}
        >
          <div className={styles.modalHeader}>
            {algorithm && (
              <fieldset className={styles.borderedElement}>
                <legend className={styles.legendTitle}>Algorithm</legend>
                <h3 className={styles.title}>
                  <Link href={`/asset/${algorithm.did}`}>{algorithmName}</Link>
                </h3>
                <span className={styles.algorithmPublisher}>
                  by <Publisher account={algorithm.owner} showName={true} />
                </span>
              </fieldset>
            )}
            {dataset && (
              <fieldset className={styles.borderedElement}>
                <legend className={styles.legendTitle}>Dataset</legend>
                <h3 className={styles.title}>
                  <Link href={`/asset/${dataset.did}`}>{datasetName}</Link>
                </h3>
                <div className={styles.requestInfo}>
                  <span className={styles.algorithmPublisher}>
                    Solicitor:{' '}
                    <Publisher account={selected.solicitor} showName={true} />
                    <Time
                      date={`${selected.created_at}`}
                      relative
                      isUnix={true}
                    />
                  </span>
                  <fieldset className={styles.borderedElement}>
                    <legend className={styles.legendTitle}>Request</legend>
                    <div className={styles.reason}>
                      {selected?.reason ?? 'No reason provided'}
                    </div>
                    <ConsentRequest values={consent.request} interactive />
                  </fieldset>
                </div>
              </fieldset>
            )}
          </div>
          {/* <span className={styles.modalState}>
        Current state:{' '}
        {selected && <ConsentStateBadge state={selected.state} />}
        </span> */}

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
      )}
    </>
  )
}
