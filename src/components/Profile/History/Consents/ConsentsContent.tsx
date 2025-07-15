import QueryBoundary from '@components/@shared/QueryBoundary'
import ConsentsFeed from './Feed/ConsentsFeed'

export default function ConsentsContent() {
  return (
    <QueryBoundary text="Loading consents">
      <ConsentsFeed />
    </QueryBoundary>
  )
}
