import { PublisherTrustedAlgorithm } from '@oceanprotocol/lib'
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
      .forEach((service) =>
        service.compute.publisherTrustedAlgorithmPublishers.push(publisherDid)
      )
})

const RequestTrustedAlgorithmUpdater = (
  algorithmDid: Readonly<NonNullable<string>>,
  newCancelToken: () => CancelToken
): AssetUpdater => ({
  update: async (asset: AssetExtended) => {
    await Promise.all(
      asset.services
        .filter(({ type }) => type === 'compute')
        .map(async (service) => {
          const newAlgorithmList = await createTrustedAlgorithmList(
            [algorithmDid],
            asset.chainId,
            newCancelToken()
          )
          service.compute.publisherTrustedAlgorithms = [
            ...(service.compute.publisherTrustedAlgorithms || []),
            ...newAlgorithmList
          ].filter(
            // Only keep one copy of each algorithm
            (
              algo: PublisherTrustedAlgorithm,
              index: number,
              self: PublisherTrustedAlgorithm[]
            ) => self.findIndex((a) => a.did === algo.did) === index
          )

          return Promise.resolve()
        })
    )
  }
})

const RequestAllowNetworkAccessUpdater = (): AssetUpdater => ({
  update: async (asset: AssetExtended) =>
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => (service.compute.allowNetworkAccess = true))
})

export const Updater = (
  consent: Consent,
  newCancelToken: () => CancelToken
) => ({
  get: (permission: keyof PossibleRequests): AssetUpdater =>
    ({
      allow_network_access: RequestAllowNetworkAccessUpdater(),
      trusted_algorithm: RequestTrustedAlgorithmUpdater(
        extractDidFromUrl(consent.algorithm),
        newCancelToken
      ),
      trusted_algorithm_publisher: RequestTrustedAlgorithmPublisherUpdater(
        consent.solicitor.address
      )
    }[permission])
})

export const AssetConsentApplier = (
  consent: Readonly<NonNullable<Consent>>,
  response: Readonly<NonNullable<ConsentResponse>>,
  accountId: Readonly<NonNullable<Address>>,
  signer: Readonly<NonNullable<Signer>>,
  newCancelToken: () => CancelToken,
  newAbortSignal: () => AbortSignal,
  switchNetworksIfNeeded: () => Promise<void>
) => ({
  apply: async (asset: AssetExtended): Promise<boolean> => {
    await switchNetworksIfNeeded()

    await Promise.all(
      Object.keys(response.permitted)
        .filter((key) => response.permitted[key])
        .map((key: keyof PossibleRequests) =>
          Updater(consent, newCancelToken).get(key).update(asset)
        )
    )

    const tx = await setNFTMetadataAndTokenURI(
      asset,
      accountId,
      signer,
      decodeTokenURI(asset.nft.tokenURI),
      newAbortSignal()
    )

    return tx ? await tx.wait().then(() => true) : false
  }
})
