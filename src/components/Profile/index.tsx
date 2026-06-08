import QueryBoundary from '@components/@shared/QueryBoundary'
import { MetadataRequestFilterProvider } from '@context/MetadataRequestFilter'
import UserMetadataRequestsProvider from '@context/UserMetadataRequests'
import AccountHeader from './Header'
import HistoryPage from './History'

export const ProfilePage = ({ accountId }: { accountId: string }) => (
  <QueryBoundary>
    <MetadataRequestFilterProvider>
      <UserMetadataRequestsProvider>
        <AccountHeader accountId={accountId} />
        <HistoryPage accountIdentifier={accountId} />
      </UserMetadataRequestsProvider>
    </MetadataRequestFilterProvider>
  </QueryBoundary>
)

export default { ProfilePage }
