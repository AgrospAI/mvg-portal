import ExcludingAccordion from '@context/ExcludingAccordion'
import { Suspense, useEffect, useRef } from 'react'
import styles from './index.module.css'
import { VerifiableCredential } from './VertifiableCredential'

interface VerifiableCredentialsProps {
  children: string[]
}

/**
 * Renders a list of verifiable credentials from the same entity.
 *
 * @param {string[]} children Renders a list of verifiable credentials from the same entity.
 * @returns {JSX.Element}
 */
export const VerifiableCredentials = ({
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
    <Suspense fallback="Loading">
      <ExcludingAccordion>
        <div className={styles.verifiableCredentials}>
          {children.map((credential, index) => (
            <section key={credential} className={styles.verifiableCredentials}>
              <ExcludingAccordion.Trigger
                ref={(el) => (refs.current[index] = el)}
                index={index}
                openCallback={() => openCallback(index)}
              >
                <h4 className={styles.credentialTitle}>
                  Verifiable credential Nº{index}
                </h4>
              </ExcludingAccordion.Trigger>
              <ExcludingAccordion.Content index={index}>
                <VerifiableCredential url={credential} />
              </ExcludingAccordion.Content>
            </section>
          ))}
        </div>
      </ExcludingAccordion>
    </Suspense>
  )
}
