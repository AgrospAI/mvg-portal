import {
  Consent,
  ConsentResponse,
  PossibleRequests
} from '@utils/consents/types'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { CancelToken } from 'axios'
import { Signer } from 'ethers'
import { Address } from 'wagmi'
import { createTrustedAlgorithmList } from './compute'
import { extractDidFromUrl } from './consents/utils'

interface AssetUpdater {
  update(asset: AssetExtended): Promise<void>
}

const RequestTrustedAlgorithmPublisherUpdater = (
  publisherDid: Readonly<NonNullable<string>>
): AssetUpdater => ({
  update: async (asset: AssetExtended) =>
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => {
        service.compute.publisherTrustedAlgorithmPublishers.push(publisherDid)
      })
})

const RequestTrustedAlgorithmUpdater = (
  algorithmDid: Readonly<NonNullable<string>>,
  newCancelToken: () => CancelToken
): AssetUpdater => ({
  update: async (asset: AssetExtended) => {
    const publisherTrustedAlgorithms = await createTrustedAlgorithmList(
      [algorithmDid],
      asset.chainId,
      newCancelToken()
    )

    const computeIndex = asset.services.findIndex((s) => s.type === 'compute')
    if (computeIndex !== -1) {
      asset.services[computeIndex].compute.publisherTrustedAlgorithms.push(
        ...publisherTrustedAlgorithms
      )
    }

    return Promise.resolve()
  }
})

const RequestAllowNetworkAccessUpdater = (): AssetUpdater => ({
  update: async (asset: AssetExtended) =>
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => {
        service.compute.allowNetworkAccess = true
      })
})

const Updater = (consent: Consent, newCancelToken: () => CancelToken) => ({
  get: (permission: keyof PossibleRequests): AssetUpdater => {
    switch (permission) {
      case 'allow_network_access':
        return RequestAllowNetworkAccessUpdater()
      case 'trusted_algorithm':
        return RequestTrustedAlgorithmUpdater(
          extractDidFromUrl(consent.algorithm),
          newCancelToken
        )
      case 'trusted_algorithm_publisher':
        return RequestTrustedAlgorithmPublisherUpdater(
          consent.solicitor.address
        )
    }
  }
})

export const AssetConsentApplier = (
  consent: Readonly<NonNullable<Consent>>,
  response: Readonly<NonNullable<ConsentResponse>>,
  accountId: Readonly<NonNullable<Address>>,
  signer: Readonly<NonNullable<Signer>>,
  newCancelToken: () => CancelToken,
  newAbortSignal: () => AbortSignal
) => ({
  apply: async (asset: AssetExtended): Promise<boolean> => {
    const consents = Object.keys(response.permitted)
    await Promise.all(
      consents
        .filter((key) => response.permitted[key])
        .map((key: keyof PossibleRequests) =>
          Updater(consent, newCancelToken).get(key).update(asset)
        )
    )

    const setMetadataTx = await setNFTMetadataAndTokenURI(
      asset,
      accountId,
      signer,
      decodeTokenURI(asset.nft.tokenURI),
      newAbortSignal()
    )

    if (!setMetadataTx) return false
    return setMetadataTx.wait().then(() => true)
  }
})
