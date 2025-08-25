import { useVerifiableCredential } from '@hooks/useVerifiableCredential'
import styles from './index.module.css'

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
  const { data } = useVerifiableCredential(url)

  return (
    <code>
      <pre className={styles.contents}>{JSON.stringify(data, null, 2)}</pre>
    </code>
  )
}
