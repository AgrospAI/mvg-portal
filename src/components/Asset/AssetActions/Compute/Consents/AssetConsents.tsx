import ConsentsPetitionProvider from '@context/Profile/ConsentsPetitionProvider'
import React from 'react'
import ConsentPetitionButton from './ConsentPetitionButton'
import { useAccount } from 'wagmi'
import { Asset } from '@oceanprotocol/lib'
import AccountConsentsProvider from '@context/Profile/AccountConsentsProvider'
import IncomingPendingConsentsSimple from './IncomingPendingConsentsSimple'

interface Props {
  asset: Asset
}

export default function AssetConsents({ asset }: Props) {
  const { address } = useAccount()

  if (address == asset.nft.owner) {
    return (
      <AccountConsentsProvider>
        <IncomingPendingConsentsSimple asset={asset} />
      </AccountConsentsProvider>
    )
  }
  return (
    <ConsentsPetitionProvider>
      <ConsentPetitionButton />
    </ConsentsPetitionProvider>
  )
}
