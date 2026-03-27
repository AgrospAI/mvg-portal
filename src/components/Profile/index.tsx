import UserMetadataRequestsProvider from '@context/UserMetadataRequests'
import AccountHeader from './Header'
import HistoryPage from './History'
import { MetadataRequestFilterProvider } from '@context/MetadataRequestFilter'

export const ProfilePage = ({ accountId }: { accountId: string }) => (
  <MetadataRequestFilterProvider>
    <UserMetadataRequestsProvider>
      <AccountHeader accountId={accountId} />
      <HistoryPage accountIdentifier={accountId} />
    </UserMetadataRequestsProvider>
  </MetadataRequestFilterProvider>
)

export default { ProfilePage }
