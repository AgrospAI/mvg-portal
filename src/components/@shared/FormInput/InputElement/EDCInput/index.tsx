import { ReactElement, useState } from 'react'
import { useField } from 'formik'
import axios from 'axios'
import Button from '@shared/atoms/Button'
import Loader from '@shared/atoms/Loader'
import FileInfoDetails from '../FilesInput/Info'
import { InputProps } from '@shared/FormInput'
import { checkValidProvider } from '@utils/provider'
import { LoggerInstance, getErrorMessage } from '@oceanprotocol/lib'
import { edcApiUrl } from '../../../../../../app.config'
import styles from './index.module.css'

interface EDCDataset {
  asset_id: string
  name: string
  description: string
  content_type: string
}

async function getEdcErrorMessage(error: unknown): Promise<string> {
  const errorData = error as {
    response?: { data?: { detail?: unknown; reason?: unknown } | Blob }
    message?: string
  }
  let responseData = errorData?.response?.data
  if (responseData instanceof Blob && responseData.type.includes('json')) {
    responseData = JSON.parse(await responseData.text())
  }
  const detail =
    responseData instanceof Blob
      ? undefined
      : responseData?.detail ?? responseData?.reason

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join('; ')
  }

  if (typeof detail === 'string') return detail

  if (detail) return JSON.stringify(detail)

  if (errorData?.response) {
    return `${errorData.message || 'EDC API request failed'} (${
      (errorData.response as any).status || 'unknown status'
    })`
  }

  return getErrorMessage(errorData?.message || String(error))
}

export default function EDCInput(props: InputProps): ReactElement {
  const [field, , helpers] = useField(props.name)
  const oceanProviderUrl = (props as any).form?.values?.services
    ? (props as any).form.values.services[0].providerUrl.url
    : undefined

  const [participantId, setParticipantId] = useState('')
  const [dspUrl, setDspUrl] = useState('')
  const [datasets, setDatasets] = useState<EDCDataset[] | null>(null)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [error, setError] = useState('')

  const canConnect = !!participantId && !!dspUrl && !isConnecting

  async function handleConnect(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setIsConnecting(true)

    try {
      const normalizedParticipantId = participantId.trim()
      const normalizedDspUrl = dspUrl.trim()

      await axios.post(`${edcApiUrl}/providers`, {
        participant_id: normalizedParticipantId,
        // Older deployments require name, while newer ones default it to the DID.
        name: normalizedParticipantId,
        dsp_url: normalizedDspUrl
      })

      const { data } = await axios.get(
        `${edcApiUrl}/providers/${encodeURIComponent(
          normalizedParticipantId
        )}/datasets`
      )
      setParticipantId(normalizedParticipantId)
      setDspUrl(normalizedDspUrl)
      setDatasets(data)
    } catch (err) {
      const message = await getEdcErrorMessage(err)
      setError(message)
      LoggerInstance.error('[EDC Input]:', message)
    } finally {
      setIsConnecting(false)
    }
  }

  function handleBack() {
    setDatasets(null)
    setSelectedAssetId('')
    setError('')
  }

  async function handleSelectAsset(dataset: EDCDataset) {
    const assetId = dataset.asset_id
    setError('')
    setSelectedAssetId(assetId)
    setIsResolving(true)

    try {
      const { data: linkData } = await axios.post(
        `${edcApiUrl}/providers/${encodeURIComponent(
          participantId
        )}/datasets/${encodeURIComponent(assetId)}/link`
      )
      const resolvedUrl = linkData.url

      const isValid = await checkValidProvider(oceanProviderUrl)
      if (!isValid)
        throw Error(
          '✗ Provider cannot be reached, please check status.oceanprotocol.com and try again later.'
        )

      // Download through EDC now: minting a link alone does not negotiate a
      // contract, and Ocean's provider cannot reach a localhost API URL.
      const { data: file, headers } = await axios.get<Blob>(resolvedUrl, {
        responseType: 'blob'
      })
      if (!file.size) throw Error('The EDC asset returned an empty file.')

      helpers.setValue([
        {
          url: resolvedUrl,
          providerUrl: oceanProviderUrl,
          type: 'url',
          edcParticipantId: participantId,
          edcAssetId: assetId,
          edcDatasetName: dataset.name,
          edcDatasetDescription: dataset.description,
          valid: true,
          contentType: dataset.content_type || headers['content-type'],
          contentLength: String(file.size)
        }
      ])
    } catch (err) {
      const message = await getEdcErrorMessage(err)
      setError(message)
      LoggerInstance.error('[EDC Input]:', message)
    } finally {
      setIsResolving(false)
    }
  }

  function handleClose() {
    helpers.setTouched(false)
    helpers.setValue([{ url: '', type: 'edc' }])
    setDatasets(null)
    setSelectedAssetId('')
  }

  if (field?.value?.[0]?.valid === true) {
    return <FileInfoDetails file={field.value[0]} handleClose={handleClose} />
  }

  return (
    <div className={styles.edc}>
      {!datasets ? (
        <>
          <div className={styles.field}>
            <label htmlFor="edcParticipantId">Participant ID (DID)</label>
            <input
              id="edcParticipantId"
              type="text"
              className={styles.input}
              placeholder="did:web:provider-identity-hub.agrospai.udl.cat:provider-connector-id"
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="edcDspUrl">DSP URL</label>
            <input
              id="edcDspUrl"
              type="text"
              className={styles.input}
              placeholder="https://provider-connector.agrospai.udl.cat/api/dsp"
              value={dspUrl}
              onChange={(e) => setDspUrl(e.target.value)}
            />
          </div>
          <Button
            style="primary"
            size="small"
            disabled={!canConnect}
            onClick={handleConnect}
          >
            {isConnecting ? <Loader /> : 'List provider assets'}
          </Button>
        </>
      ) : (
        <>
          <Button style="text" size="small" onClick={handleBack}>
            &larr; Back
          </Button>
          {datasets.length === 0 ? (
            <p>No assets found for this provider.</p>
          ) : (
            <ul className={styles.assetList}>
              {datasets.map((dataset) => (
                <li key={dataset.asset_id}>
                  <button
                    type="button"
                    className={styles.assetButton}
                    disabled={isResolving}
                    onClick={() => handleSelectAsset(dataset)}
                  >
                    <span className={styles.assetName}>{dataset.name}</span>
                    {dataset.description && (
                      <span className={styles.assetDescription}>
                        {dataset.description}
                      </span>
                    )}
                    {isResolving && selectedAssetId === dataset.asset_id && (
                      <Loader />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}
