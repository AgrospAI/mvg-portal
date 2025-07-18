import { useDeleteConsentResponse } from '@hooks/useUserConsents'
import DeleteButton from './Delete'

function DeleteConsentResponse() {
  const { mutateAsync: deleteConsentResponse } = useDeleteConsentResponse()

  return (
    <DeleteButton action={({ id }) => deleteConsentResponse({ consentId: id })}>
      consent response
    </DeleteButton>
  )
}

export default DeleteConsentResponse
