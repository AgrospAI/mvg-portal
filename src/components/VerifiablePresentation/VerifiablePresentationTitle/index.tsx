import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import { GaiaXVerifiablePresentation } from '@utils/verifiablePresentations/types'
import styles from './index.module.css'

interface VerifiablePresentationTitleProperties {
  index: number
  verifiablePresentation: GaiaXVerifiablePresentation
}

export const VerifiablePresentationTitle = ({
  index,
  verifiablePresentation
}: VerifiablePresentationTitleProperties) => {
  useVerifiablePresentationContext()

  if (!verifiablePresentation) return <>Couldnt read vp</>

  const credentials = verifiablePresentation.verifiableCredential.filter(
    (credential) => credential.credentialSubject.type === 'gx:LegalParticipant'
  )

  if (!credentials) {
    return <p>Missing participant verifiable credential</p>
  }

  const participant = credentials[0]

  return (
    <button className={styles.credentialTitle}>
      {index}. {participant.credentialSubject['gx:legalName']}
    </button>
  )
}
