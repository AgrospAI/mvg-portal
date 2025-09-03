import { VerifiablePresentationMessage } from '@components/VerifiablePresentation/VerifiablePresentationMessage'
import ExcludingAccordion from '@context/ExcludingAccordion'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import { useRef } from 'react'
import { VerifiablePresentationTitle } from '../VerifiablePresentationTitle/index'
import styles from './index.module.css'
import { VerifiablePresentation } from '..'

export const VerifiablePresentationAccordion = () => {
  const { verifiablePresentations } = useVerifiablePresentationContext()
  const refs = useRef<(HTMLElement | null)[]>([])

  const openCallback = (index: number) => {
    setTimeout(() => {
      refs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 0)
  }

  if (verifiablePresentations.length === 0)
    return (
      <VerifiablePresentationMessage variant="info">
        No verifiable credentials found.
      </VerifiablePresentationMessage>
    )

  return (
    <ExcludingAccordion>
      {verifiablePresentations.map(({ data, error }, index) => (
        <>
          {error ? (
            <VerifiablePresentationMessage variant="warn">
              There was an error fetching the verifiable presentation:{' '}
              {String(error)}
            </VerifiablePresentationMessage>
          ) : (
            <>
              <ExcludingAccordion.Trigger
                index={index}
                ref={(el) => (refs.current[index] = el)}
                openCallback={() => openCallback(index)}
              >
                <VerifiablePresentationTitle
                  index={index}
                  verifiablePresentation={data}
                />
              </ExcludingAccordion.Trigger>
              <ExcludingAccordion.Content index={index}>
                <div className={styles.content}>
                  <VerifiablePresentation verifiablePresentation={data} />
                </div>
              </ExcludingAccordion.Content>
            </>
          )}
        </>
      ))}
    </ExcludingAccordion>
  )
}
