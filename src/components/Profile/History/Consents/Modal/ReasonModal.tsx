import Modal from '@components/@shared/atoms/Modal'
import Time from '@components/@shared/atoms/Time'
import {
  extractDidFromUrl,
  getAsset,
  getConsentDetailed
} from '@utils/consentsUser'
import { useConsents } from '../../../../../@context/Profile/ConsentsProvider'
import styles from './ReasonModal.module.css'
import { useEffect, useState } from 'react'
import { getAssetsNames } from '@utils/aquarius'
import axios from 'axios'
import Publisher from '@components/@shared/Publisher'
import ConsentRequest from '@components/Profile/History/Consents/ConsentRequest'
import ModalSection from './ModalSection'
import ConsentModalActions from './Actions'
import AssetLink from './AssetLink'

export default function ReasonModal() {
  const { selected, isInspect, isInteractiveInspect, setIsInspect } =
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

  const horizontalSections = [
    {
      title: '1. Algorithm',
      content: (
        <>
          {algorithm && (
            <>
              <AssetLink did={algorithm.did} name={algorithmName} />
              <span className={styles.publisher}>
                by <Publisher account={algorithm.owner} showName />
              </span>
            </>
          )}
        </>
      )
    },
    {
      title: '2. Dataset',
      content: (
        <>
          {dataset && (
            <>
              <AssetLink did={dataset.did} name={datasetName} />
              <span className={styles.publisher}>
                by <Publisher account={dataset.owner} showName />
              </span>
            </>
          )}
        </>
      )
    }
  ]

  const sections = [
    {
      content: (
        <>
          <div className={styles.horizontalContainer}>
            {horizontalSections.map((section, index) => (
              <ModalSection key={index} title={section.title}>
                {section.content}
              </ModalSection>
            ))}
          </div>
        </>
      )
    },
    {
      content: (
        <>
          {selected && (
            <ModalSection title="3. Request">
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
                    />
                  )}
                </div>
              </div>
            </ModalSection>
          )}
        </>
      )
    },
    {
      content: (
        <>
          {isInteractiveInspect && selected && (
            <ModalSection title="4. Response">
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
                      interactive
                    />
                  )}
                </div>
              </div>
              <ConsentModalActions />
            </ModalSection>
          )}
        </>
      )
    }
  ]

  return (
    <>
      {selected && (
        <Modal
          title=""
          onToggleModal={() => setIsInspect(!isInspect)}
          isOpen={isInspect}
          className={styles.modal}
        >
          {sections.map((section, index) => (
            <div key={index}>{section.content}</div>
          ))}
        </Modal>
      )}
    </>
  )
}
