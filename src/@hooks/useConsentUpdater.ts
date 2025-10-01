import { Updater } from '@utils/assetConsentApplier'
import { Consent, PossibleRequests } from '@utils/consents/types'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { Signer } from 'ethers'
import { useCallback } from 'react'
import { useAbortController } from './useAbortController'
import { useCancelToken } from './useCancelToken'

export const useConsentUpdater = (asset: AssetExtended) => {
  const newAbortSignal = useAbortController()
  const newCancelToken = useCancelToken()

  const update = useCallback(
    async (consent: Consent, signer: Signer) => {
      await Promise.all(
        Object.keys(consent.response.permitted)
          .filter((k) => consent.response.permitted[k])
          .map((key: keyof PossibleRequests) =>
            Updater(consent, newCancelToken).get(key).update(asset)
          )
      )

      const tx = await setNFTMetadataAndTokenURI(
        asset,
        await signer.getAddress(),
        signer,
        decodeTokenURI(asset.nft.tokenURI),
        newAbortSignal()
      )

      return tx ? await tx.wait().then(() => true) : false
    },
    [asset, newAbortSignal, newCancelToken]
  )

  return { update }
}
