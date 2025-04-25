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
  const {
    selected,
    setSelected,
    updateSelected,
    isInspect,
    isInteractiveInspect,
    setIsInspect
  } = useConsents()

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
            <div className={styles.horizontalContainer}>
              {algorithm && (
                <fieldset
                  className={`${styles.borderedElement} ${styles.fullHeight}`}
                >
                  <legend className={styles.legendTitle}>1. Algorithm</legend>
                  <h3 className={styles.title}>
                    <Link href={`/asset/${algorithm.did}`}>
                      {algorithmName}
                    </Link>
                  </h3>
                  <span className={styles.publisher}>
                    by <Publisher account={algorithm.owner} showName={true} />
                  </span>
                </fieldset>
              )}
              {dataset && (
                <fieldset className={styles.borderedElement}>
                  <legend className={styles.legendTitle}>2. Dataset</legend>
                  <h3 className={styles.title}>
                    <Link href={`/asset/${dataset.did}`}>{datasetName}</Link>
                  </h3>
                  <span className={styles.publisher}>
                    by <Publisher account={dataset.owner} showName={true} />
                  </span>
                </fieldset>
              )}
            </div>
            <fieldset className={styles.borderedElement}>
              <legend className={styles.legendTitle}>3. Request</legend>
              <span className={styles.publisher}>
                <Publisher account={selected.solicitor} showName={true} />,
                <Time date={`${selected.created_at}`} relative isUnix={true} />
              </span>
              <div className={styles.requestInfo}>
                <div className={styles.reason}>
                  {selected.reason ?? 'No reason provided'}
                </div>
                <div className={styles.requestContainer}>
                  <p>Requests for:</p>
                  {consent && consent.request && (
                    <ConsentRequest
                      values={consent.request}
                      dataset={{ ...dataset, name: datasetName }}
                      algorithm={{ ...algorithm, name: algorithmName }}
                      solicitor={consent.solicitor}
                    />
                  )}
                </div>
              </div>
            </fieldset>
            {isInteractiveInspect && (
              <fieldset className={styles.borderedElement}>
                <legend className={styles.legendTitle}>4. Response</legend>
                <div className={styles.requestInfo}>
                  <div className={styles.reason}>
                    <input
                      type="text"
                      className={styles.responseTextbox}
                      maxLength={255}
                      placeholder="Reason of the response..."
                    />
                  </div>
                  <div className={styles.requestContainer}>
                    <p>Accepted requests:</p>
                    {consent && consent.request && (
                      <ConsentRequest
                        values={consent.request}
                        dataset={{ ...dataset, name: datasetName }}
                        algorithm={{ ...algorithm, name: algorithmName }}
                        solicitor={consent.solicitor}
                        interactive
                      />
                    )}
                  </div>
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
              </fieldset>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
