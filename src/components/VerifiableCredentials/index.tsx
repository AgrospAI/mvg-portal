import ExcludingAccordion from '@context/ExcludingAccordion'
import { ReactNode, Suspense, useRef } from 'react'
import styles from './index.module.css'
import { VerifiableCredential } from './VertifiableCredential'

interface VerifiableCredentialsProps {
  credentials: string[]
  children?: ReactNode
}

/**
 * Renders a list of verifiable credentials from the same entity.
 *
 * @param {string[]} credentials Renders a list of verifiable credentials from the same entity.
 * @param {ReactNode?} children Before rendering the list of credentials "header-like"
 * @returns {JSX.Element}
 */
export const VerifiableCredentials = ({
  credentials,
  children
}: Readonly<VerifiableCredentialsProps>): JSX.Element => {
  const refs = useRef<(HTMLElement | null)[]>([])

  const openCallback = (index: number) => {
    setTimeout(() => {
      refs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  return (
    <>
      {children}
      <Suspense fallback="Loading">
        <ExcludingAccordion>
          <div className={styles.verifiableCredentials}>
            {credentials.map((credential, index) => (
              <section
                key={credential}
                className={styles.verifiableCredentials}
              >
                <ExcludingAccordion.Trigger
                  ref={(el) => (refs.current[index] = el)}
                  index={index}
                  openCallback={() => openCallback(index)}
                >
                  <button className={styles.credentialTitle}>
                    Verifiable credential Nº{index + 1}
                  </button>
                </ExcludingAccordion.Trigger>
                <ExcludingAccordion.Content index={index}>
                  <div className={styles.content}>
                    <VerifiableCredential url={credential} />
                  </div>
                </ExcludingAccordion.Content>
              </section>
            ))}
          </div>
        </ExcludingAccordion>
      </Suspense>
    </>
  )
}
