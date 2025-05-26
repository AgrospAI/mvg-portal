import { useAccount } from 'wagmi'
import ConsentPetitionButton from './ConsentPetitionButton'
import IncomingPendingConsentsSimple from './IncomingPendingConsentsSimple'

interface Props {
  asset: AssetExtended
}

export default function AssetConsents({ asset }: Props) {
  const { address } = useAccount()

  if (address === asset.nft.owner) {
    return <IncomingPendingConsentsSimple asset={asset} />
  }

  if (asset.metadata.algorithm) {
    return <></>
  }

  return <ConsentPetitionButton asset={asset} />
}
