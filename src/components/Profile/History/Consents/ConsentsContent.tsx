import Button from '@components/@shared/atoms/Button'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import ConsentsFeed from './Feed/ConsentsFeed'
import { Suspense } from 'react'
import Loader from '@components/@shared/atoms/Loader'

function ConsentsContent() {
  return (
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
            <ConsentsFeed />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export default ConsentsContent
