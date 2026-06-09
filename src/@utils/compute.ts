import {
  Asset,
  ComputeAlgorithm,
  ComputeEnvironment,
  ComputeJob,
  DDO,
  getErrorMessage,
  getHash,
  LoggerInstance,
  ProviderInstance,
  PublisherTrustedAlgorithm,
  Service,
  ServiceComputeOptions
} from '@oceanprotocol/lib'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { CancelToken } from 'axios'
import { toast } from 'react-toastify'
import { gql } from 'urql'
import { SortTermOptions } from '../@types/aquarius/SearchQuery'
import { ComputeEditForm } from '../components/Asset/Edit/_types'
import {
  generateBaseQuery,
  getAssetsFromDids,
  getFilterTerm,
  queryMetadata
} from './aquarius'
import { transformAssetToAssetSelection } from './assetConvertor'
import { getServiceById, getServiceByName } from './ddo'
import { getFileDidInfo } from './provider'
import { fetchDataForMultipleChains } from './subgraph'

const getComputeOrdersByDatatokenList = gql`
  query ComputeOrdersByDatatokenList($user: String!, $datatokens: [String!]!) {
    orders(
      orderBy: createdTimestamp
      orderDirection: desc
      where: { payer: $user, datatoken_in: $datatokens }
    ) {
      id
      serviceIndex
      datatoken {
        address
      }
      tx
      createdTimestamp
    }
  }
`

async function getAssetMetadata(
  queryDtList: string[],
  cancelToken: CancelToken,
  chainIds: number[],
  type: 'dataset' | 'algorithm'
): Promise<Asset[]> {
  const filters = [getFilterTerm('metadata.type', type)]

  if (type === 'algorithm')
    filters.push(getFilterTerm('services.datatokenAddress', queryDtList))

  const baseQueryparams = {
    chainIds,
    filters,
    ignorePurgatory: true
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryparams)
  const result = await queryMetadata(query, cancelToken)

  return result?.results
}

export async function isOrderable(
  asset: Asset | DDO,
  serviceId: string,
  algorithm: ComputeAlgorithm,
  algorithmDDO: Asset | DDO
): Promise<boolean> {
  const datasetService: Service = getServiceById(asset, serviceId)
  if (!datasetService) return false

  if (datasetService.type === 'compute') {
    if (algorithm.meta) {
      // check if raw algo is allowed
      if (datasetService.compute.allowRawAlgorithm) return true
      LoggerInstance.error('ERROR: This service does not allow raw algorithm')
      return false
    }
    if (algorithm.documentId) {
      const algoService: Service = getServiceById(
        algorithmDDO,
        algorithm.serviceId
      )
      if (algoService && algoService.type === 'compute') {
        if (algoService.serviceEndpoint !== datasetService.serviceEndpoint) {
          this.logger.error(
            'ERROR: Both assets with compute service are not served by the same provider'
          )
          return false
        }
      }
    }
  }
  return true
}

export function getValidUntilTime(
  computeEnvMaxJobDuration: number,
  datasetTimeout?: number,
  algorithmTimeout?: number
) {
  const inputValues = []
  computeEnvMaxJobDuration && inputValues.push(computeEnvMaxJobDuration)
  datasetTimeout && inputValues.push(datasetTimeout)
  algorithmTimeout && inputValues.push(algorithmTimeout)

  const minValue = Math.min(...inputValues)
  const mytime = new Date()
  mytime.setMinutes(mytime.getMinutes() + Math.floor(minValue / 60))
  return Math.floor(mytime.getTime() / 1000)
}

export async function getComputeEnvironment(
  asset: Asset
): Promise<ComputeEnvironment> {
  if (asset?.services[0]?.type !== 'compute') return null
  try {
    const computeEnvs = await ProviderInstance.getComputeEnvironments(
      asset.services[0].serviceEndpoint
    )
    const computeEnv = Array.isArray(computeEnvs)
      ? computeEnvs[0]
      : computeEnvs[asset.chainId][0]

    if (!computeEnv) return null
    return computeEnv
  } catch (e) {
    const message = getErrorMessage(e.message)
    LoggerInstance.error(
      '[Compute to Data] Fetch compute environment:',
      message
    )
    toast.error(message)
  }
}

export function getQueryString(
  trustedAlgorithmList: PublisherTrustedAlgorithm[],
  trustedPublishersList: string[],
  chainId?: number
): SearchQuery {
  const algorithmDidList = trustedAlgorithmList?.map((x) => x.did)

  const baseParams = {
    chainIds: [chainId],
    sort: { sortBy: SortTermOptions.Created },
    filters: [getFilterTerm('metadata.type', 'algorithm')],
    esPaginationOptions: {
      size: 3000
    }
  } as BaseQueryParams
  algorithmDidList?.length > 0 &&
    baseParams.filters.push(getFilterTerm('_id', algorithmDidList))
  trustedPublishersList?.length > 0 &&
    baseParams.filters.push(
      getFilterTerm(
        'nft.owner',
        trustedPublishersList.map((address) => address.toLowerCase())
      )
    )
  const query = generateBaseQuery(baseParams)

  return query
}

export async function getAlgorithmsForAsset(
  asset: Asset,
  token: CancelToken
): Promise<Asset[]> {
  const computeService: Service = getServiceByName(asset, 'compute')

  if (
    !computeService.compute ||
    (computeService.compute.publisherTrustedAlgorithms?.length === 0 &&
      computeService.compute.publisherTrustedAlgorithmPublishers?.length === 0)
  ) {
    return []
  }

  const gueryResults = await queryMetadata(
    getQueryString(
      computeService.compute.publisherTrustedAlgorithms,
      computeService.compute.publisherTrustedAlgorithmPublishers,
      asset.chainId
    ),
    token
  )
  const algorithms: Asset[] = gueryResults?.results
  return algorithms
}

export async function getAlgorithmAssetSelectionList(
  asset: Asset,
  algorithms: Asset[],
  accountId: string
): Promise<AssetSelectionAsset[]> {
  if (!algorithms || algorithms?.length === 0) return []

  const computeService: Service = getServiceByName(asset, 'compute')
  let algorithmSelectionList: AssetSelectionAsset[]
  if (!computeService.compute) {
    algorithmSelectionList = []
  } else {
    algorithmSelectionList = await transformAssetToAssetSelection(
      computeService?.serviceEndpoint,
      algorithms,
      accountId,
      []
    )
  }
  return algorithmSelectionList
}

async function getJobs(
  providerUrls: string[],
  accountId: string,
  datasets: Asset[]
): Promise<ComputeJobMetaData[]> {
  const uniqueProviders = [...new Set(providerUrls)]
  const providersComputeJobsExtended: ComputeJobExtended[] = []
  const computeJobs: ComputeJobMetaData[] = []

  try {
    const results = (await Promise.all(
      uniqueProviders.map((provider) =>
        ProviderInstance.computeStatus(provider, accountId)
      )
    )) as ComputeJob[][]

    console.log('Results', results)

    results.forEach((providerComputeJobs, idx) => {
      providerComputeJobs.forEach((job) =>
        providersComputeJobsExtended.push({
          ...job,
          providerUrl: uniqueProviders[idx]
        })
      )
    })

    console.log('Results', providersComputeJobsExtended)

    providersComputeJobsExtended
      .sort((a, b) => Number(b.dateCreated) - Number(a.dateCreated))
      .forEach((job) => {
        const did = job.inputDID[0]?.toLowerCase()

        const asset = datasets?.find((x) => x.id.toLowerCase() === did)

        if (asset) {
          const compJob: ComputeJobMetaData = {
            ...job,
            assetName: asset.metadata.name,
            assetDtSymbol: asset?.datatokens[0].symbol,
            networkId: asset.chainId
          }
          computeJobs.push(compJob)
        }
      })
  } catch (err) {
    const message = getErrorMessage(err.message)
    LoggerInstance.error('[Compute to Data] Error:', message)
    toast.error(message)
  }
  return computeJobs
}

/**
 * in case multiple providers return the same computeJob, filter these duplicates
 * e.g. same instance listens on multiple domains
 */
export function filterForUniqueJobs(
  jobs: ComputeJobMetaData[],
  assets: Asset[]
): ComputeJobMetaData[] {
  return jobs.filter((job) => {
    const { inputDID, providerUrl } = job

    // compare providerUrl where the job status was accessed from
    // with the serviceEndpoint found in asset with first inputDID
    const inputAsset = assets.find((asset) => asset.id === inputDID[0])
    return providerUrl === inputAsset?.services[0]?.serviceEndpoint
  })
}

async function getAlgorithmDatatokenAddresses(
  chainIds: number[],
  cancelToken: CancelToken
): Promise<string[]> {
  const baseQueryparams = {
    chainIds,
    filters: [getFilterTerm('metadata.type', 'algorithm')],
    ignorePurgatory: true
  } as BaseQueryParams
  const query = generateBaseQuery(baseQueryparams)
  const result = await queryMetadata(query, cancelToken)
  return (
    result?.results?.flatMap(
      (asset) => asset.datatokens?.map((dt) => dt.address.toLowerCase()) || []
    ) ?? []
  )
}

export async function getComputeJobs(
  chainIds: number[],
  accountId: string,
  asset?: AssetExtended,
  cancelToken?: CancelToken
): Promise<ComputeResults> {
  if (!accountId) return

  const assetDTAddress = asset?.datatokens[0]?.address
  const computeResult: ComputeResults = {
    computeJobs: [],
    isLoaded: false
  }

  const variables = assetDTAddress
    ? {
        user: accountId.toLowerCase(),
        datatokens: [assetDTAddress.toLowerCase()]
      }
    : {
        user: accountId.toLowerCase(),
        datatokens: await getAlgorithmDatatokenAddresses(chainIds, cancelToken)
      }

  const results = await fetchDataForMultipleChains(
    getComputeOrdersByDatatokenList,
    variables,
    assetDTAddress ? [asset?.chainId] : chainIds
  )

  let tokenOrders: TokenOrder[] = []
  results.map((result) =>
    result.orders.forEach((tokenOrder: TokenOrder) =>
      tokenOrders.push(tokenOrder)
    )
  )
  if (tokenOrders.length === 0) {
    computeResult.isLoaded = true
    return computeResult
  }

  tokenOrders = tokenOrders.sort(
    (a, b) => b.createdTimestamp - a.createdTimestamp
  )

  console.log('tokenOrders', tokenOrders)

  const dataDtAddresses = []

  tokenOrders.forEach((order) => {
    const splitId = order.id.split('-')
    dataDtAddresses.push(splitId[0])
  })

  if (!dataDtAddresses) return

  // Now that we have the different algorithm dt -> Get the assets from ES filtering by the active tags.
  const datasets = await getAssetMetadata(
    dataDtAddresses,
    cancelToken,
    chainIds,
    'dataset'
  )

  console.log('Datasets', datasets)

  const providerUrls: string[] = []
  datasets.forEach((asset: Asset) =>
    providerUrls.push(asset.services[0].serviceEndpoint)
  )

  const allProviderJobs = await getJobs(providerUrls, accountId, datasets)

  // computeResult.computeJobs = allProviderJobs
  computeResult.computeJobs = filterForUniqueJobs(allProviderJobs, datasets)

  computeResult.isLoaded = true

  return computeResult
}

export async function createTrustedAlgorithmList(
  selectedAlgorithms: string[], // list of DIDs,
  assetChainId: number,
  cancelToken: CancelToken
): Promise<PublisherTrustedAlgorithm[]> {
  const trustedAlgorithms: PublisherTrustedAlgorithm[] = []

  // Condition to prevent app from hitting Aquarius with empty DID list
  // when nothing is selected in the UI.
  if (!selectedAlgorithms || selectedAlgorithms.length === 0)
    return trustedAlgorithms

  const selectedAssets = await getAssetsFromDids(
    selectedAlgorithms,
    [assetChainId],
    cancelToken
  )

  if (!selectedAssets || selectedAssets.length === 0) return []

  for (const selectedAlgorithm of selectedAssets) {
    const filesChecksum = await getFileDidInfo(
      selectedAlgorithm?.id,
      selectedAlgorithm?.services?.[0].id,
      selectedAlgorithm?.services?.[0]?.serviceEndpoint,
      true
    )
    const containerChecksum =
      selectedAlgorithm.metadata.algorithm.container.entrypoint +
      selectedAlgorithm.metadata.algorithm.container.checksum
    const trustedAlgorithm = {
      did: selectedAlgorithm.id,
      containerSectionChecksum: getHash(containerChecksum),
      filesChecksum: filesChecksum?.[0]?.checksum
    }
    trustedAlgorithms.push(trustedAlgorithm)
  }
  return trustedAlgorithms
}

export async function transformComputeFormToServiceComputeOptions(
  values: ComputeEditForm,
  currentOptions: ServiceComputeOptions,
  assetChainId: number,
  cancelToken: CancelToken
): Promise<ServiceComputeOptions> {
  const publisherTrustedAlgorithms = values.allowAllPublishedAlgorithms
    ? null
    : await createTrustedAlgorithmList(
        values.publisherTrustedAlgorithms,
        assetChainId,
        cancelToken
      )

  // TODO: add support for selecting trusted publishers and transforming here.
  // This only deals with basics so we don't accidentially allow all accounts
  // to be trusted.
  const publisherTrustedAlgorithmPublishers: string[] = []

  const privacy: ServiceComputeOptions = {
    ...currentOptions,
    publisherTrustedAlgorithms,
    publisherTrustedAlgorithmPublishers
  }

  return privacy
}
