import { ReactElement } from 'react'
import { prettySize } from './utils'
import cleanupContentType from '@utils/cleanupContentType'
import Button from '@shared/atoms/Button'
import styles from './Info.module.css'
import { FileInfo as FileInfoData } from '@oceanprotocol/lib'

interface EDCFileInfoData extends FileInfoData {
  edcAssetId?: string
  edcDatasetName?: string
  edcDatasetDescription?: string
}

export default function FileInfo({
  file,
  handleClose
}: {
  file: EDCFileInfoData
  handleClose(): void
}): ReactElement {
  const contentTypeCleaned = file.contentType
    ? cleanupContentType(file.contentType)
    : null

  const isEdcFile = !!file.edcAssetId
  const hideUrl = file.type === 'hidden' || false

  return (
    <div className={`${styles.info}`}>
      {isEdcFile ? (
        <div className={styles.edcMeta}>
          <h3 className={styles.url}>{file.edcDatasetName}</h3>
          {file.edcDatasetDescription && (
            <p className={styles.edcDescription}>
              {file.edcDatasetDescription}
            </p>
          )}
        </div>
      ) : (
        <h3 className={`${styles.url} ${hideUrl ? styles.hideUrl : null}`}>
          {hideUrl ? 'https://delta-dao/the-future-is-now' : file.url}
        </h3>
      )}
      <ul>
        <li className={styles.success}>✓ File confirmed</li>
        {file.contentLength && <li>{prettySize(+file.contentLength)}</li>}
        {contentTypeCleaned && <li>{contentTypeCleaned}</li>}
      </ul>
      {isEdcFile && (
        <Button
          href={file.url}
          target="_blank"
          rel="noreferrer"
          download
          style="text"
          size="small"
        >
          Download
        </Button>
      )}
      <button className={styles.removeButton} onClick={handleClose}>
        &times;
      </button>
    </div>
  )
}
