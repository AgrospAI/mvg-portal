import { useVerifiableCredential } from '@hooks/useVerifiableCredential'
import styles from './index.module.css'
import { VerifiableCredentialsInfo } from '../VerifiableCredentialsInfo'

interface VerifiableCredentialProps {
  url: string
}

/**
 * Gathers and renders the verifiable credential from the given URL.
 *
 * @param {string} url Public URL to the verifiable credential
 * @returns {JSX.Element}
 *
 * @example <caption>Rendering UdL's verifiable credential</caption>
 * <VerifiableCredential url="https://compliance.agrospai.udl.cat/.well-known/UdL.vp.json" />
 */
export const VerifiableCredential = ({
  url
}: Readonly<VerifiableCredentialProps>): JSX.Element => {
  const { data, error } = useVerifiableCredential(url)

  if (!url)
    return (
      <VerifiableCredentialsInfo variant="info">
        Missing verifiable credentials URL.
      </VerifiableCredentialsInfo>
    )

  if (error)
    return (
      <VerifiableCredentialsInfo variant="warn">
        Error fetching the provided URL: {url}. {String(error)}
      </VerifiableCredentialsInfo>
    )

  return (
    <code>
      <pre className={styles.contents}>{JSON.stringify(data, null, 2)}</pre>
    </code>
  )
}
