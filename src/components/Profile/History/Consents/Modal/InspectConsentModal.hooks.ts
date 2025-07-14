import { useModal } from '@context/Modal'
import { useListConsent } from '@hooks/useListConsent'
import { useCreateConsentResponse } from '@hooks/useUserConsents'
import { Consent } from '@utils/consents/types'
import { extractFormDetails } from '@utils/consents/utils'
import { useState } from 'react'

export const useInspectConsentModal = (consent: Consent) => {
  const { isInteractive, setSelected } = useModal()
  const { datasetQuery, algorithmQuery } = useListConsent(consent)

  const { closeModal } = useModal()
  const [isAccepted, setIsAccepted] = useState(false)

  const { mutateAsync: createConsentResponse } = useCreateConsentResponse()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { reason, request: permitted } = extractFormDetails(e.target, {
      reasonField: 'response-reason',
      isAccepted,
      excludeFields: ['algorithm']
    })

    createConsentResponse(
      { consentId: consent.id, reason, permitted },
      {
        onSuccess: closeModal
      }
    )
  }

  return {
    isInteractive,
    setSelected,
    dataset: datasetQuery?.data,
    datasetIsLoading: datasetQuery?.isLoading,
    algorithm: algorithmQuery?.data,
    algorithmIsLoading: algorithmQuery?.isLoading,
    handleSubmit,
    setIsAccepted
  }
}
