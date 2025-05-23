import { useModal } from '@context/Modal'
import { Consent } from '@utils/consents/types'
import { isIncoming, isPending } from '@utils/consents/utils'
import { useCallback } from 'react'
import InspectConsentModal from '../../Modal/InspectConsentModal'
import { useDeleteConsentResponse } from '@hooks/useUserConsents'

export const useConsentRowActions = (consent: Consent) => {
  const { setSelected, setIsInteractive, openModal, setCurrentModal } =
    useModal()

  const { mutate: handleDelete } = useDeleteConsentResponse()

  const handleInspect = useCallback(() => {
    setCurrentModal(<InspectConsentModal consent={consent} />)
    setSelected(consent)
    setIsInteractive(isPending(consent) && isIncoming(consent))
    openModal()
  }, [consent, openModal, setCurrentModal, setIsInteractive, setSelected])

  return {
    handleInspect,
    handleDelete: () => handleDelete({ consent }),
    setCurrentModal
  }
}
