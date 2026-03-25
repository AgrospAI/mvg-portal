import Modal from '@components/@shared/Modal'
import QueryBoundary from '@components/@shared/QueryBoundary'
import UserMetadataRequestsProvider from '@context/UserMetadataRequests'
import ConsentsFeed from './Feed/ConsentsFeed'
import { MetadataRequestFilterProvider } from './Feed/MetadataRequestFilters/MetadataRequestFilter'

export const ConsentsContent = () => (
  <QueryBoundary text="Loading consents">
    <Modal>
      <MetadataRequestFilterProvider>
        <UserMetadataRequestsProvider>
          <ConsentsFeed />
        </UserMetadataRequestsProvider>
      </MetadataRequestFilterProvider>
    </Modal>
  </QueryBoundary>
)

export default { ConsentsContent }
