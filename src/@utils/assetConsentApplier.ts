import { PublisherTrustedAlgorithm } from '@oceanprotocol/lib'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { CancelToken } from 'axios'
import { Signer } from 'ethers'
import { createTrustedAlgorithmList } from './compute'

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
    const isCompute = (service) => service?.type === 'compute'

    console.log('Updating', asset)

    await Promise.all(
      asset.services.filter(isCompute).map(async (service) => {
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
  request: ExtendedMetadataRequest,
  newCancelToken: () => CancelToken
) => ({
  get: (type: MetadataSubRequest['requestType']): AssetUpdater =>
    ({
      0: RequestAllowNetworkAccessUpdater(),
      1: RequestTrustedAlgorithmUpdater(request.algorithm.did, newCancelToken),
      2: RequestTrustedAlgorithmPublisherUpdater(request.requester)
    }[type])
})

export const AssetConsentApplier = (
  request: Readonly<NonNullable<ExtendedMetadataRequest>>,
  subRequests: Readonly<NonNullable<MetadataSubRequest[]>>,
  signer: Readonly<NonNullable<Signer>>,
  newCancelToken: () => CancelToken,
  newAbortSignal: () => AbortSignal
) => ({
  apply: async (asset: AssetExtended): Promise<void> => {
    const isFavorable = (request: MetadataSubRequest) =>
      Number(request.yesWeight) > Number(request.noWeight)

    const permitted = subRequests.filter(isFavorable) || []

    if (permitted.length === 0) return

    const previousAsset = JSON.stringify(asset)

    await Promise.all(
      permitted.map(({ requestType }) =>
        Updater(request, newCancelToken).get(requestType).update(asset)
      )
    )

    // If the underlying asset did not change, do not update the blockchain
    if (previousAsset === JSON.stringify(asset)) return

    const tx = await setNFTMetadataAndTokenURI(
      asset,
      await signer.getAddress(),
      signer,
      decodeTokenURI(asset.nft.tokenURI),
      newAbortSignal()
    )

    if (!tx || !(await tx.wait()))
      throw new Error('Failed to execute transaction')
  }
})
