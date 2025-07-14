import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactElement, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import NumberUnit from './NumberUnit'
import { useStats } from './Stats.hooks'
import styles from './Stats.module.css'

export default function Stats(): ReactElement {
  const {
    assetsTotal,
    sales,
    incomingPendingConsents,
    outgoingPendingConsents,
    solicitedPendingConsents
  } = useStats()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={typeof sales !== 'number' || sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ resetErrorBoundary }) => (
              <>
                <div>There was an error!</div>
                <Button onClick={() => resetErrorBoundary()}>Try again</Button>
              </>
            )}
          >
            <Suspense fallback={<Loader message="Loading consents..." />}>
              <NumberUnit
                label="Incoming Pending Consents"
                value={incomingPendingConsents}
              />
              <NumberUnit
                label="Outgoing Pending Consents"
                value={outgoingPendingConsents}
              />
              <NumberUnit
                label="Solicited Pending Consents"
                value={solicitedPendingConsents}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
