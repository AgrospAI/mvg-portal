import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/atoms/Modal'
import Time from '@components/@shared/atoms/Time'
import Publisher from '@components/@shared/Publisher'
import ConsentRequest, {
  PossibleRequests
} from '@components/Profile/History/Consents/ConsentRequest'
import { useConsents } from '@context/Profile/ConsentsProvider'
import { getAssetsNames } from '@utils/aquarius'
import {
  Consent,
  ConsentResponse,
  ConsentsAsset,
  extractDidFromUrl,
  getAsset,
  getConsentDetailed,
  getConsentResponse,
  parsePossibleRequest,
  updateConsent
} from '@utils/consentsUser'
import axios from 'axios'
import { useEffect, useState } from 'react'
import styles from './ReasonModal.module.css'
import AssetLink from './Sections/AssetLink'
import ModalSection from './Sections/ModalSection'

export default function ReasonModal() {
  const {
    incoming,
    selected,
    isInspect,
    isInteractiveInspect,
    setIncoming,
    setIsInspect,
    setSelected
  } = useConsents()

  const [algorithmName, setAlgorithmName] = useState<string>()
  const [datasetName, setDatasetName] = useState<string>()

  const [algorithm, setAlgorithm] = useState<ConsentsAsset>()
  const [dataset, setDataset] = useState<ConsentsAsset>()

  const [consent, setConsent] = useState<Consent>()
  const [consentResponse, setConsentResponse] =
    useState<ConsentResponse | null>()

  // Response of the form
  const [isAccepted, setIsAccepted] = useState(false)

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

    getConsentDetailed(selected.url).then((data) => {
      setConsent(data)
      data.response &&
        getConsentResponse(data.response).then(setConsentResponse)
    })

    return () => {
      source.cancel()
    }
  }, [selected])

  const handleSubmit = (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)

    const reason = formData.get('response-reason').toString()
    formData.delete('response-reason')

    let permitted: PossibleRequests | null = {} as PossibleRequests
    if (isAccepted) {
      permitted = parsePossibleRequest(formData)
    } else {
      permitted = null
    }

    const permittedRequests = permitted ? JSON.stringify(permitted) : '0'
    updateConsent(selected.url, reason, permittedRequests).then((data) => {
      selected.status = data.status
      setIncoming(
        incoming.map((inc) => (inc.url === selected.url ? selected : inc))
      )
    })

    setIsInspect(false)
    setSelected(null)
  }

  const horizontalSections = [
    {
      title: '1. Algorithm',
      content: (
        <>
          {algorithm && (
            <div className={styles.horizontalContent}>
              <AssetLink did={algorithm.did} name={algorithmName} />
              <span className={styles.publisher}>
                by <Publisher account={algorithm.owner} showName />
              </span>
            </div>
          )}
        </>
      )
    },
    {
      title: '2. Dataset',
      content: (
        <>
          {dataset && (
            <div className={styles.horizontalContent}>
              <AssetLink did={dataset.did} name={datasetName} />
              <span className={styles.publisher}>
                by <Publisher account={dataset.owner} showName />
              </span>
            </div>
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
                  {consent && consent.request ? (
                    <>
                      <p>Requests for:</p>
                      <ConsentRequest
                        values={consent.request}
                        datasetDid={dataset.did}
                        datasetName={datasetName}
                        algorithmDid={algorithm.did}
                        algorithmName={algorithmName}
                        algorithmOwnerAddress={algorithm.owner}
                      />
                    </>
                  ) : (
                    <span className={styles.requestListItem}>
                      No requests provided
                    </span>
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
          {selected && isInteractiveInspect ? (
            <ModalSection title="4. Response">
              <form onSubmit={handleSubmit}>
                <div className={styles.requestInfo}>
                  <div className={styles.reason}>
                    <input
                      name="response-reason"
                      type="text"
                      className={styles.responseTextbox}
                      maxLength={255}
                      placeholder="Reason of the response..."
                    />
                  </div>
                  <div className={styles.requestContainer}>
                    {consent && consent.request ? (
                      <>
                        <p>Accepted requests:</p>
                        <ConsentRequest
                          values={consent.request}
                          datasetDid={dataset.did}
                          datasetName={datasetName}
                          algorithmDid={algorithm.did}
                          algorithmName={algorithmName}
                          algorithmOwnerAddress={algorithm.owner}
                          interactive
                        />
                      </>
                    ) : (
                      <span className={styles.requestListItem}>
                        No requests provided
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <Button
                    size="small"
                    name="reject"
                    className={styles.reject}
                    onClick={() => setIsAccepted(false)}
                  >
                    Reject
                  </Button>
                  <Button
                    size="small"
                    name="accept"
                    className={styles.confirm}
                    onClick={() => setIsAccepted(true)}
                  >
                    Accept
                  </Button>
                </div>
              </form>
            </ModalSection>
          ) : (
            <>
              {consentResponse && (
                <ModalSection title="4. Response">
                  <div className={styles.requestInfo}>
                    <div className={styles.reason}>
                      <p className={styles.responseTextbox}>
                        {consentResponse.reason}
                      </p>
                    </div>
                    <div className={styles.requestContainer}>
                      {consent && consent.request ? (
                        <>
                          <p>Accepted requests:</p>
                          <ConsentRequest
                            values={consentResponse.permitted}
                            datasetDid={dataset.did}
                            datasetName={datasetName}
                            algorithmDid={algorithm.did}
                            algorithmName={algorithmName}
                            algorithmOwnerAddress={algorithm.owner}
                          />
                        </>
                      ) : (
                        <span className={styles.requestListItem}>
                          No permissions provided
                        </span>
                      )}
                    </div>
                  </div>
                </ModalSection>
              )}
            </>
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
