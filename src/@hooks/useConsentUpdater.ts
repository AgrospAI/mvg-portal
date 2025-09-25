import { useAbortController } from '@hooks/useAbortController'
import { useCancelToken } from '@hooks/useCancelToken'
import { AssetConsentApplier } from '@utils/assetConsentApplier'
import { Consent } from '@utils/consents/types'
import { Signer } from 'ethers'
import { Address } from 'wagmi'

export const useConsentUpdater = (address: Address, signer: Signer) => {
  const newAbortSignal = useAbortController()
  const newCancelToken = useCancelToken()

  return {
    newUpdater: (consent: Consent) =>
      AssetConsentApplier(
        consent,
        consent.response,
        address,
        signer,
        newCancelToken,
        newAbortSignal
      )
  }
}
