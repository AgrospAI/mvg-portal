import { Updater } from '@utils/assetConsentApplier'
import { Consent, PossibleRequests } from '@utils/consents/types'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { Signer } from 'ethers'
import { useCallback, useRef } from 'react'
import { useSwitchNetwork } from 'wagmi'
import { useAbortController } from './useAbortController'
import { useAutoSigner } from './useAutoSigner'
import { useCancelToken } from './useCancelToken'
import { toast } from 'react-toastify'

export const useConsentUpdater = (asset: AssetExtended) => {
  const { signer, accountId, getAutoSigner } = useAutoSigner()
  const { switchNetworkAsync } = useSwitchNetwork()

  const newAbortSignal = useAbortController()
  const newCancelToken = useCancelToken()

  const freshSigner = useRef<Signer | undefined>(signer)

  if (signer && !freshSigner.current) {
    freshSigner.current = signer
  }

  const requestUpdate = useCallback(
    async (consent: Consent): Promise<boolean> => {
      if (!asset) throw new Error('Undefined asset')
      if (!freshSigner.current) throw new Error('No signer available')

      if (asset.chainId !== (await signer.getChainId())) {
        console.log('Switching networks ...')

        await switchNetworkAsync(asset.chainId)
        freshSigner.current = getAutoSigner()
        console.log(
          'New signer Chain Id',
          await freshSigner.current.getChainId()
        )
      }

      const currentChainId = await freshSigner.current.getChainId()
      if (currentChainId !== asset.chainId) {
        toast.error(
          `Wrong network: expected ${asset.chainId}, got ${currentChainId}`
        )
        return false
      }

      await Promise.all(
        Object.keys(consent.response.permitted)
          .filter((k) => consent.response.permitted[k])
          .map((key: keyof PossibleRequests) =>
            Updater(consent, newCancelToken).get(key).update(asset)
          )
      )

      const tx = await setNFTMetadataAndTokenURI(
        asset,
        accountId,
        freshSigner.current,
        decodeTokenURI(asset.nft.tokenURI),
        newAbortSignal()
      )

      return tx ? await tx.wait().then(() => true) : false
    },
    [
      asset,
      signer,
      accountId,
      newAbortSignal,
      switchNetworkAsync,
      getAutoSigner,
      newCancelToken
    ]
  )

  return { requestUpdate }
}
