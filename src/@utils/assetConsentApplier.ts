import { Asset, LoggerInstance } from '@oceanprotocol/lib'
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

interface AssetUpdater {
  update(asset: Asset): Promise<void>
}

class RequestTrustedAlgorithmPublisherUpdater implements AssetUpdater {
  private readonly publisher: Readonly<NonNullable<string>>

  constructor(publisher: Readonly<NonNullable<string>>) {
    this.publisher = publisher
  }

  async update(asset: Asset): Promise<void> {
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => {
        service.compute.publisherTrustedAlgorithmPublishers.push(this.publisher)
      })
  }
}

class RequestTrustedAlgorithmUpdater implements AssetUpdater {
  private readonly algorithm: Readonly<NonNullable<string>>
  private readonly accountId: Address
  private readonly signer: Signer
  private readonly newCancelToken: () => CancelToken
  private readonly newAbortSignal: () => AbortSignal

  constructor(
    algorithm: Readonly<NonNullable<string>>,
    accountId: Address,
    signer: Signer,
    newCancelToken: () => CancelToken,
    newAbortSignal: () => AbortSignal
  ) {
    this.algorithm = algorithm
    this.accountId = accountId
    this.signer = signer
    this.newCancelToken = newCancelToken
    this.newAbortSignal = newAbortSignal
  }

  async update(asset: Asset): Promise<void> {
    const publisherTrustedAlgorithms = await createTrustedAlgorithmList(
      [this.algorithm],
      asset.chainId,
      this.newCancelToken()
    )

    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => {
        service.compute.publisherTrustedAlgorithms.push(
          ...publisherTrustedAlgorithms
        )
      })

    LoggerInstance.log('[Edited asset]', asset)
    await setNFTMetadataAndTokenURI(
      asset,
      this.accountId,
      this.signer,
      decodeTokenURI(asset.nft.tokenURI),
      this.newAbortSignal()
    )
  }
}

class RequestAllowNetworkAccessUpdater implements AssetUpdater {
  async update(asset: Asset): Promise<void> {
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => {
        service.compute.allowNetworkAccess = true
      })
  }
}

export class AssetConsentApplier {
  private readonly consent: Readonly<NonNullable<Consent>>
  private readonly consentResponse: Readonly<NonNullable<ConsentResponse>>
  private readonly accountId: Address
  private readonly signer: Signer
  private readonly newCancelToken: () => CancelToken
  private readonly newAbortSignal: () => AbortSignal

  constructor(
    consent: Readonly<NonNullable<Consent>>,
    accountId: Address,
    signer: Signer,
    newCancelToken: () => CancelToken,
    newAbortSignal: () => AbortSignal
  ) {
    this.consent = consent
    this.accountId = accountId
    this.signer = signer
    this.newCancelToken = newCancelToken
    this.newAbortSignal = newAbortSignal
  }

  apply(asset: Readonly<NonNullable<Asset>>): AssetConsentApplier {
    const _asset = asset
    const consents = Object.keys(this.consentResponse.permitted)
    consents
      .filter((key) => consents[this.consentResponse.permitted[key]])
      .forEach((key) => this.get(key as keyof PossibleRequests).update(_asset))
    return this
  }

  private get(key: keyof PossibleRequests): AssetUpdater {
    switch (key) {
      case 'allow_network_access':
        return new RequestAllowNetworkAccessUpdater()
      case 'trusted_algorithm':
        return new RequestTrustedAlgorithmUpdater(
          this.consent.algorithm,
          this.accountId,
          this.signer,
          this.newCancelToken,
          this.newAbortSignal
        )
      case 'trusted_algorithm_publisher':
        return new RequestTrustedAlgorithmPublisherUpdater(
          this.consent.solicitor.address
        )
    }
  }
}
