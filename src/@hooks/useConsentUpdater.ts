import { useAbortController } from '@hooks/useAbortController'
import { useCancelToken } from '@hooks/useCancelToken'
import { AssetConsentApplier } from '@utils/assetConsentApplier'
import { Consent } from '@utils/consents/types'
import { useAutoSigner } from './useAutoSigner'

export const useConsentUpdater = (consent: Consent) => {
  const { signer, accountId } = useAutoSigner()

  const newAbortSignal = useAbortController()
  const newCancelToken = useCancelToken()

  const consentApplier = new AssetConsentApplier(
    consent,
    accountId,
    signer,
    newCancelToken,
    newAbortSignal
  )

  return consentApplier
}
