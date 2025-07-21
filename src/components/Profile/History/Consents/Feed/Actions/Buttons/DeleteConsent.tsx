import { useDeleteConsent } from '@hooks/useUserConsents'
import DeleteButton from './Delete'

function DeleteConsent() {
  const { mutateAsync: deleteConsent } = useDeleteConsent()

  return (
    <DeleteButton action={(consent) => deleteConsent({ consent })}>
      consent
    </DeleteButton>
  )
}

export default DeleteConsent
