import QueryBoundary from '@components/@shared/QueryBoundary'
import UserMetadataRequestsProvider from '@context/UserMetadataRequests'
import { useAccount } from 'wagmi'
import ConsentPetitionButton from './ConsentPetitionButton'
import IncomingPendingConsentsSimple from './IncomingPendingConsentsSimple'

interface Props {
  asset: AssetExtended
}

export default function AssetConsents({ asset }: Props) {
  const { address } = useAccount()

  if (address === asset?.nft?.owner) {
    return (
      <>
        <QueryBoundary text="Loading incoming consents">
          <UserMetadataRequestsProvider address={address}>
            <IncomingPendingConsentsSimple asset={asset} />
          </UserMetadataRequestsProvider>
        </QueryBoundary>
      </>
    )
  }

  if (!asset || asset.metadata?.algorithm) return null

  return (
    <QueryBoundary text="Checking connectivity">
      <ConsentPetitionButton asset={asset} />
    </QueryBoundary>
  )
}
