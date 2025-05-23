import { Consent } from '@utils/consents/types'
import BaseModal from './BaseModal/BaseModal'
import { useInspectConsentModal } from './InspectConsentModal.hooks'

interface InspectConsentModalProps {
  consent: Consent
}

function InspectConsentModal({ consent }: InspectConsentModalProps) {
  const {
    isInteractive,
    dataset,
    datasetIsLoading,
    algorithm,
    algorithmIsLoading,
    setIsAccepted,
    handleSubmit
  } = useInspectConsentModal(consent)

  return (
    <BaseModal title="Inspect Consent">
      <BaseModal.Section title="1. Assets">
        <BaseModal.Asset title="Your dataset" asset={dataset} />
        <BaseModal.Separator />
        <BaseModal.Asset title="Requesting algorithm" asset={algorithm} />
      </BaseModal.Section>
      <BaseModal.Section title="2. Request">
        <BaseModal.Request
          consent={consent}
          dataset={dataset}
          algorithm={algorithm}
          isLoading={datasetIsLoading || algorithmIsLoading}
        />
      </BaseModal.Section>
      {isInteractive ? (
        <BaseModal.Section title="3. Response">
          <BaseModal.InteractiveResponse
            consent={consent}
            dataset={dataset}
            handleAccept={() => setIsAccepted(true)}
            handleReject={() => setIsAccepted(false)}
            handleSubmit={handleSubmit}
          />
        </BaseModal.Section>
      ) : (
        consent.response && (
          <BaseModal.Section title="3. Response">
            <BaseModal.Status status={consent.status} />
            <BaseModal.Response
              response={consent.response}
              dataset={dataset}
              algorithm={algorithm}
            />
          </BaseModal.Section>
        )
      )}
    </BaseModal>
  )
}

export default InspectConsentModal
