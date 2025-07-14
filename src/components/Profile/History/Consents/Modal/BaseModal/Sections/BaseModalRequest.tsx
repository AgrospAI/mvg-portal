import Time from '@components/@shared/atoms/Time'
import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import { Consent } from '@utils/consents/types'
import { useBaseModal } from '../BaseModal'
import RequestsList from '../Components/RequestsList'
import styles from './BaseModalRequest.module.css'

interface BaseModalRequestProps {
  consent: Consent
  dataset?: Asset
  algorithm?: Asset
  isLoading?: boolean
}

function BaseModalRequest({
  consent,
  dataset,
  algorithm,
  isLoading
}: BaseModalRequestProps) {
  useBaseModal()

  const permissions = consent.request ?? {}

  if (isLoading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <span className={styles.publisher}>
        <Publisher account={consent.solicitor.address} showName={true} />,{' '}
        <Time date={`${consent.created_at}`} relative isUnix={true} />
      </span>
      <div className={styles.requestInfo}>
        {consent.reason && (
          <fieldset className={styles.reason}>
            <legend className={styles.reasonTitle}>Reason provided</legend>
            <span>{consent.reason}</span>
          </fieldset>
        )}
        {dataset && algorithm && (
          <div className={styles.requestContainer}>
            <RequestsList
              permissions={permissions}
              dataset={dataset}
              algorithm={algorithm}
              showFull
            />
          </div>
        )}
      </div>
    </>
  )
}

export default BaseModalRequest
