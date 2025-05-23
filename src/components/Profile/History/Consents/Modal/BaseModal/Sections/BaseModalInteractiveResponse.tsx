import { Asset } from '@oceanprotocol/lib'
import { Consent } from '@utils/consents/types'
import { useBaseModal } from '../BaseModal'
import ConsentRequest from '../Components/ConsentRequest'
import BaseModalActions from './BaseModalActions'
import styles from './BaseModalInteractiveResponse.module.css'

interface BaseModalInteractiveResponseProps {
  consent: Consent
  dataset: Asset
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleAccept?: () => void
  handleReject?: () => void
}

function BaseModalInteractiveResponse({
  consent,
  dataset,
  handleSubmit,
  handleAccept,
  handleReject
}: BaseModalInteractiveResponseProps) {
  useBaseModal()

  return (
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
          {consent.request && (
            <>
              <p>Accepted requests:</p>
              {dataset && (
                <>
                  <ConsentRequest values={consent.request} interactive />
                  {(handleAccept || handleReject) && (
                    <BaseModalActions
                      acceptText="Submit"
                      handleAccept={handleAccept}
                      rejectText="Reject All"
                      handleReject={handleReject}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  )
}

export default BaseModalInteractiveResponse
