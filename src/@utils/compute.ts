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

const log = (msg: any, ...params: any[]) => {
  LoggerInstance.log('[compute]', msg, params)
}

async function getAssetMetadata(
  queryList: string[],
  cancelToken: CancelToken,
  chainIds: number[],
  type: 'dataset' | 'algorithm',
  filterField: string = 'services.datatokenAddress'
): Promise<Asset[]> {
  const filters = [
    getFilterTerm('metadata.type', type),
    getFilterTerm(filterField, queryList)
  ]

  const baseQueryparams = {
    chainIds,
    filters,
    ignorePurgatory: true
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryparams)
  const result = await queryMetadata(query, cancelToken)

  return result?.results.flat()
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

const toOrders = (data: any[]): TokenOrder[] =>
  data
    .flatMap((result) => result.orders as TokenOrder[])
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)

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

const gqlVariables = async ({
  chainIds,
  accountId,
  asset,
  cancelToken
}: {
  chainIds: number[]
  accountId: string
  asset?: AssetExtended
  cancelToken?: CancelToken
}) => ({
  user: accountId.toLowerCase(),
  datatokens: asset
    ? [asset!.datatokens[0]!.address.toLowerCase()]
    : await getAlgorithmDatatokenAddresses(chainIds, cancelToken)
})

async function fetchRawJobs(
  accountId: string,
  providerUrls: string[],
  orderTxs?: Set<string>,
  asset?: Asset
): Promise<ComputeJobExtended[]> {
  const settled = await Promise.allSettled(
    providerUrls.map((provider) =>
      ProviderInstance.computeStatus(provider, accountId)
    )
  )

  const results = settled.map((result, idx) => {
    if (result.status === 'rejected') {
      LoggerInstance.warn(
        `[Compute to Data] Failed to fetch jobs from ${providerUrls[idx]}:`,
        result.reason?.message
      )
      return []
    }
    return result.value
  }) as ComputeJob[][]

  return results
    .flatMap((providerJobs, idx) =>
      providerJobs.map((job) => ({ ...job, providerUrl: providerUrls[idx] }))
    )
    .filter((job) => {
      if (orderTxs && !orderTxs.has(job.agreementId.toLowerCase())) return false
      if (!asset) return true

      return asset.metadata.type === 'algorithm'
        ? job.algoDID?.toLowerCase() === asset.id.toLowerCase()
        : job.inputDID.some(
            (did) => did.toLowerCase() === asset.id.toLowerCase()
          )
    })
    .sort((a, b) => Number(b.dateCreated) - Number(a.dateCreated))
}

async function enrichJobs(
  rawJobs: ComputeJobExtended[],
  chainIds: number[],
  cancelToken?: CancelToken
): Promise<ComputeResults> {
  const inputDIDs = [...new Set(rawJobs.flatMap((job) => job.inputDID))]

  const datasets = await getAssetMetadata(
    inputDIDs,
    cancelToken,
    chainIds,
    'dataset',
    '_id'
  )

  log('datasets', datasets)

  const allProviderJobs: ComputeJobMetaData[] = rawJobs.map((job) => {
    const dataset = datasets.find((x) =>
      job.inputDID.some((did) => did.toLowerCase() === x.id.toLowerCase())
    )

    if (!dataset) {
      log('DID NOT FIND', job)
    }

    return {
      ...job,
      assetName: dataset?.metadata.name ?? job.inputDID[0],
      assetDtSymbol: dataset?.datatokens[0].symbol ?? '',
      networkId: dataset?.chainId
    }
  })

  return {
    computeJobs: filterForUniqueJobs(allProviderJobs, datasets),
    isLoaded: true
  }
}

const assetsToUniqueProviders = (assets: Asset[]) => [
  ...new Set(assets.map((asset: Asset) => asset.services[0].serviceEndpoint))
]

export const getUserComputeJobs = async (
  tokenOrders: TokenOrder[],
  chainIds: number[],
  accountId: string,
  cancelToken?: CancelToken
): Promise<ComputeResults> => {
  if (!chainIds || !accountId) return

  // Fetch all the user data
  const algorithms = await getAssetMetadata(
    tokenOrders.map((order) => order.datatoken.address), // dt addresses
    cancelToken,
    chainIds,
    'algorithm'
  )

  const rawJobs = await fetchRawJobs(
    accountId,
    assetsToUniqueProviders(algorithms),
    new Set(tokenOrders.map((order) => order.tx.toLowerCase()))
  )

  log('algorithms', algorithms)
  log('rawJobs', rawJobs)

  return enrichJobs(rawJobs, chainIds, cancelToken)
}

export const getAssetComputeJobs = async (
  chainIds: number[],
  accountId: string,
  asset: AssetExtended,
  cancelToken?: CancelToken
): Promise<ComputeResults> => {
  if (!chainIds || !accountId || !asset) return

  const rawJobs = await fetchRawJobs(
    accountId,
    assetsToUniqueProviders([asset]),
    undefined,
    asset
  )
  return enrichJobs(rawJobs, [asset.chainId], cancelToken)
}

export const getComputeJobs = async (
  chainIds: number[],
  accountId: string,
  asset?: AssetExtended,
  cancelToken?: CancelToken
): Promise<ComputeResults> => {
  const chains = asset ? [asset.chainId] : chainIds

  // Get past Tokens related to the given asset or user
  const tokenOrders = toOrders(
    await fetchDataForMultipleChains(
      getComputeOrdersByDatatokenList,
      await gqlVariables({
        chainIds: chains,
        accountId,
        asset,
        cancelToken
      }),
      chains
    )
  ).flat()

  if (tokenOrders.length === 0)
    return {
      computeJobs: [],
      isLoaded: true
    } as ComputeResults

  log('tokens', tokenOrders)

  return asset
    ? getAssetComputeJobs(chains, accountId, asset, cancelToken)
    : getUserComputeJobs(tokenOrders, chains, accountId, cancelToken)
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
