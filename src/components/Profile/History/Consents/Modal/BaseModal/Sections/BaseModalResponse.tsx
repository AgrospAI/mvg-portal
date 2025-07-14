import { Asset } from '@oceanprotocol/lib'
import { ConsentResponse } from '@utils/consents/types'
import { useBaseModal } from '../BaseModal'
import RequestsList from '../Components/RequestsList'
import styles from './BaseModalResponse.module.css'

interface BaseModalResponseProps {
  response: ConsentResponse
  dataset: Asset
  algorithm: Asset
}

function BaseModalResponse({
  response,
  dataset,
  algorithm
}: BaseModalResponseProps) {
  useBaseModal()

  return (
    <div className={styles.requestInfo}>
      <div className={styles.reason}>
        Dataset owner response:
        <div className={styles.responseTextbox}>{response.reason}</div>
      </div>
      {response.status !== 'Denied' && (
        <>
          Grants consent to:
          {dataset && algorithm && (
            <RequestsList
              permissions={response.permitted}
              dataset={dataset}
              algorithm={algorithm}
              showFull
            />
          )}
        </>
      )}
    </div>
  )
}

export default BaseModalResponse
