import { useDeleteConsent } from '@hooks/useUserConsents'
import DeleteButton from './Delete'
import { Consent } from '@utils/consents/types'

interface Props {
  condition: (consent: Consent) => boolean
}

function DeleteConsentResponse({ condition }: Props) {
  const { mutate: deleteConsentResponse } = useDeleteConsent()

  return (
    <DeleteButton action={deleteConsentResponse} condition={condition}>
      consent response
    </DeleteButton>
  )
}

export default DeleteConsentResponse
