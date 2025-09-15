import { VerifiableCredential } from '@components/Profile/Header/VerifiableCredential'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import External from '@images/external.svg'
import { filterVerifiableCredentialType } from '@utils/verifiablePresentations/utils'
import Link from 'next/link'
import { Address } from 'wagmi'
import { VerifiablePresentationMessage } from '../VerifiablePresentationMessage'
import { VerifiablePresentationVerification } from '../VerifiablePresentationVerification'
import styles from './index.module.css'

interface VerifiablePresentationCardProperties {
  address: Address
  className?: string
}

export const VerifiablePresentationCard = ({
  address,
  className
}: VerifiablePresentationCardProperties) => {
  const { verifiablePresentations } = useVerifiablePresentationContext()
  if (!verifiablePresentations.length) return <></>

  const data = verifiablePresentations
    .filter(({ error }) => !error)
    .map(({ data }) => data)

  if (!data || !data[0] || !data[0].verifiableCredential) {
    return (
      <VerifiablePresentationMessage variant="warn">
        All found verifiable presentations are faulty
      </VerifiablePresentationMessage>
    )
  }

  const verifiableCredentials = filterVerifiableCredentialType(
    data[0],
    'gx:LegalParticipant'
  )
  if (!verifiableCredentials || !verifiableCredentials[0]) {
    return (
      <VerifiablePresentationMessage variant="warn">
        Could not find representative information in Verifiable Presentation
      </VerifiablePresentationMessage>
    )
  }

  const verifiableCredential = verifiableCredentials[0]
  const legalAddress = verifiableCredential.credentialSubject['gx:legalAddress']

  const legalRegistrationNumberVerifiableCredential =
    filterVerifiableCredentialType(data[0], 'gx:legalRegistrationNumber')[0]

  return (
    <section className={`${className} ${styles.container}`}>
      <VerifiableCredential address={address}>
        <span
          className={styles.title}
          data-full={verifiableCredential.credentialSubject['gx:legalName']}
        >
          {verifiableCredential.credentialSubject['gx:legalName']}
        </span>
      </VerifiableCredential>

      <div className={styles.descriptions}>
        <span className={styles.description}>
          {legalAddress?.['gx:streetAddress']},{' '}
          {legalAddress?.['gx:postalCode']}, {legalAddress?.['gx:locality']},{' '}
          {
            legalRegistrationNumberVerifiableCredential.credentialSubject[
              'gx:vatID-countryCode'
            ]
          }
        </span>

        <span className={styles.description}>
          {
            legalRegistrationNumberVerifiableCredential.credentialSubject[
              'gx:vatID'
            ]
          }
        </span>
      </div>

      <Link
        href={verifiableCredential.credentialSubject.id}
        target="_blank"
        className={styles.link}
      >
        {verifiableCredential.credentialSubject.id}
        <External />
      </Link>
      {verifiablePresentations && verifiablePresentations[0]?.data && (
        <VerifiablePresentationVerification
          verifiablePresentation={verifiablePresentations[0]?.data}
          index={0}
          className={styles.credentials}
        />
      )}
    </section>
  )
}
