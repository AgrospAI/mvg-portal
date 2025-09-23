import { useAbortController } from '@hooks/useAbortController'
import { useCancelToken } from '@hooks/useCancelToken'
import { AssetConsentApplier } from '@utils/assetConsentApplier'
import { Consent } from '@utils/consents/types'
import { useAutoSigner } from './useAutoSigner'

export const useConsentUpdater = () => {
  const { signer, accountId } = useAutoSigner()

  const newAbortSignal = useAbortController()
  const newCancelToken = useCancelToken()

  return {
    newUpdater: (consent: Consent) =>
      AssetConsentApplier(
        consent,
        consent.response,
        accountId,
        signer,
        newCancelToken,
        newAbortSignal
      )
  }
}
