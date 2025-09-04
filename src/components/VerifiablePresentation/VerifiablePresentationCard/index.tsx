import Time from '@components/@shared/atoms/Time'
import { VerifiableCredential } from '@components/Profile/Header/VerifiableCredential'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import External from '@images/external.svg'
import { filterVerifiableCredentialType } from '@utils/verifiablePresentations/utils'
import Link from 'next/link'
import { Address } from 'wagmi'
import { VerifiablePresentationMessage } from '../VerifiablePresentationMessage'
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

      <span className={styles.description}>
        {legalAddress?.['gx:streetAddress']}, {legalAddress?.['gx:postalCode']},{' '}
        {legalAddress?.['gx:locality']},{' '}
        {legalAddress?.['gx:countrySubdivisionCode']}
      </span>
      <Link
        href={verifiableCredential.credentialSubject.id}
        target="_blank"
        className={styles.link}
      >
        {verifiableCredential.credentialSubject.id}
        <External />
      </Link>
      <span className={styles.verification}>
        Verification Issuance{' '}
        <Time
          date={verifiableCredential.issuanceDate}
          className={styles.date}
        />
        <VerifiableCredential address={address} />
      </span>
    </section>
  )
}
