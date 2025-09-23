import QueryBoundary from '@components/@shared/QueryBoundary'
import { useAccount } from 'wagmi'
import ConsentPetitionButton from './ConsentPetitionButton'
import IncomingPendingConsentsSimple from './IncomingPendingConsentsSimple'
import AssetProvider from '@context/Asset'

interface Props {
  asset: AssetExtended
}

export default function AssetConsents({ asset }: Props) {
  const { address } = useAccount()

  if (address === asset.nft.owner) {
    return (
      <>
        <QueryBoundary text="Loading incoming consents">
          <AssetProvider did={asset.id}>
            <IncomingPendingConsentsSimple asset={asset} />
          </AssetProvider>
        </QueryBoundary>
      </>
    )
  }

  if (asset.metadata.algorithm) {
    return <></>
  }

  return (
    <QueryBoundary text="Checking connectivity">
      <ConsentPetitionButton asset={asset} />
    </QueryBoundary>
  )
}
