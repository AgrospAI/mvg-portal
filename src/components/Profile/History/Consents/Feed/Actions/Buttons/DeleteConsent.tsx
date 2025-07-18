import { useDeleteConsent } from '@hooks/useUserConsents'
import DeleteButton from './Delete'

function DeleteConsent() {
  const { mutateAsync: deleteConsent } = useDeleteConsent()

  return <DeleteButton action={() => deleteConsent}>consent</DeleteButton>
}

export default DeleteConsent
