import Modal from '@components/@shared/Modal'
import QueryBoundary from '@components/@shared/QueryBoundary'
import ConsentsFeed from './Feed/ConsentsFeed'

export const ConsentsContent = () => (
  <QueryBoundary text="Loading consents">
    <Modal>
      <ConsentsFeed />
    </Modal>
  </QueryBoundary>
)

export default { ConsentsContent }
