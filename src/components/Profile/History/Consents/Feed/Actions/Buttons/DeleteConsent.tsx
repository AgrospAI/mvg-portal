import { useDeleteConsent } from '@hooks/useUserConsents'
import DeleteButton from './Delete'
import { Consent } from '@utils/consents/types'

interface Props {
  condition: (consent: Consent) => boolean
}

function DeleteConsent({ condition }: Props) {
  const { mutate: deleteConsent } = useDeleteConsent()

  return (
    <DeleteButton action={deleteConsent} condition={condition}>
      consent
    </DeleteButton>
  )
}

export default DeleteConsent
