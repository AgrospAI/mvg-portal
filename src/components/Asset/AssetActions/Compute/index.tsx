import { useAsset } from '@context/Asset'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useUserPreferences } from '@context/UserPreferences'
import { useAbortController } from '@hooks/useAbortController'
import { useCancelToken } from '@hooks/useCancelToken'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import {
  Asset,
  AssetPrice,
  ComputeAlgorithm,
  ComputeAsset,
  ComputeEnvironment,
  ComputeOutput,
  DDO,
  Datatoken,
  FileInfo,
  LoggerInstance,
  ProviderComputeInitializeResults,
  ProviderFees,
  ProviderInstance,
  UserCustomParameters,
  ZERO_ADDRESS,
  getErrorMessage,
  unitsToAmount
} from '@oceanprotocol/lib'
import Alert from '@shared/atoms/Alert'
import FileIcon from '@shared/FileIcon'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import Price from '@shared/Price'
import SuccessConfetti from '@shared/SuccessConfetti'
import {
  getAccessDetails,
  getAvailablePrice,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'
import { getAssetsFromDids } from '@utils/aquarius'
import {
  getAlgorithmAssetSelectionList,
  getAlgorithmsForAsset,
  getComputeJobs,
  isOrderable
} from '@utils/compute'
import { getServiceByName, secondsToString } from '@utils/ddo'
import { getComputeFeedback } from '@utils/feedback'
import { handleComputeOrder } from '@utils/order'
import {
  getComputeEnvironments,
  initializeProviderForCompute
} from '@utils/provider'
import { getDummySigner } from '@utils/wallet'
import { Decimal } from 'decimal.js'
import { Signer } from 'ethers'
import { Formik } from 'formik'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import ComputeJobs from '../../../Profile/History/ComputeJobs'
import { parseConsumerParameterValues } from '../ConsumerParameters'
import {
  ComputeDatasetForm,
  getComputeValidationSchema,
  getInitialValues
} from './_constants'
import AssetComputeSelectionSearch from './AssetComputeSelectionSearch'
import FormStartComputeDataset from './FormComputeDataset'
import ComputeHistory from './History'
import styles from './index.module.css'
import WhitelistIndicator from './WhitelistIndicator'

const refreshInterval = 10000 // 10 sec.

export default function Compute({
  accountId,
  signer,
  asset,
  dtBalance,
  file,
  isAccountIdWhitelisted,
  fileIsLoading,
  consumableFeedback
}: {
  accountId: string
  signer: Signer
  asset: AssetExtended
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  fileIsLoading?: boolean
  consumableFeedback?: string
}): ReactElement {
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

  const {
    appConfig: { defaultTokenSymbol }
  } = useMarketMetadata()

  const newAbortController = useAbortController()
  const newCancelToken = useCancelToken()

  const [isOrdering, setIsOrdering] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [error, setError] = useState<string>()

  const [algorithmList, setAlgorithmList] = useState<AssetSelectionAsset[]>()
  const [ddoAlgorithmList, setDdoAlgorithmList] = useState<Asset[]>()
  const isAlgorithm = asset?.metadata?.type === 'algorithm'
  const [selectedAlgorithmAsset, setSelectedAlgorithmAsset] = useState<
    AssetExtended | undefined
  >(isAlgorithm ? asset : undefined)
  const [hasAlgoAssetDatatoken, setHasAlgoAssetDatatoken] = useState<boolean>()
  const [algorithmDTBalance, setAlgorithmDTBalance] = useState<string>()

  const [validOrderTx, setValidOrderTx] = useState('')
  const [validAlgorithmOrderTx, setValidAlgorithmOrderTx] = useState('')

  const [isConsumablePrice, setIsConsumablePrice] = useState(true)
  const [isConsumableaAlgorithmPrice, setIsConsumableAlgorithmPrice] =
    useState(true)
  const [computeStatusText, setComputeStatusText] = useState('')
  const [computeEnvs, setComputeEnvs] = useState<ComputeEnvironment[]>()
  const [selectedComputeEnv, setSelectedComputeEnv] =
    useState<ComputeEnvironment>()
  const [initializedProviderResponse, setInitializedProviderResponse] =
    useState<ProviderComputeInitializeResults>()
  const [providerFeeAmount, setProviderFeeAmount] = useState<string>('0')
  const [providerFeesSymbol, setProviderFeesSymbol] =
    useState<string>(defaultTokenSymbol)
  const [computeValidUntil, setComputeValidUntil] = useState<string>('0')
  const [datasetOrderPriceAndFees, setDatasetOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [algoOrderPriceAndFees, setAlgoOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [isRequestingAlgoOrderPrice, setIsRequestingAlgoOrderPrice] =
    useState(false)
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [retry, setRetry] = useState<boolean>(false)
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const { isAssetNetwork } = useAsset()
  const { autoWallet } = useAutomation()

  const logComputeSubmit = (...args: unknown[]) => {
    console.log('[compute-submit]', ...args)
  }

  const summarizeComputeAsset = (computeAsset: ComputeAsset) => ({
    documentId: computeAsset?.documentId,
    serviceId: computeAsset?.serviceId,
    transferTxId: computeAsset?.transferTxId,
    hasUserdata: !!computeAsset?.userdata
  })

  const price: AssetPrice = getAvailablePrice(asset)

  const hasDatatoken = Number(dtBalance) >= 1
  const isComputeButtonDisabled =
    isOrdering === true ||
    file === null ||
    (!validOrderTx && !hasDatatoken && !isConsumablePrice) ||
    (!validAlgorithmOrderTx &&
      !hasAlgoAssetDatatoken &&
      !isConsumableaAlgorithmPrice)

  const isUnsupportedPricing = asset?.accessDetails?.type === 'NOT_SUPPORTED'

  async function checkAssetDTBalance(asset: DDO) {
    if (!asset?.services[0].datatokenAddress) return
    const dummySigner = await getDummySigner(asset?.chainId)
    const datatokenInstance = new Datatoken(dummySigner)
    const dtBalance = await datatokenInstance.balance(
      asset?.services[0].datatokenAddress,
      accountId || ZERO_ADDRESS // if the user is not connected, we use ZERO_ADDRESS as accountId
    )

    setAlgorithmDTBalance(new Decimal(dtBalance).toString())
    const hasAlgoDt = Number(dtBalance) >= 1
    setHasAlgoAssetDatatoken(hasAlgoDt)
  }

  async function setComputeFees(
    providerData: ProviderComputeInitializeResults
  ): Promise<ProviderComputeInitializeResults> {
    if (asset.accessDetails.validProviderFees) {
      providerData.datasets[0].providerFee.providerFeeAmount = '0'
    }

    const providerFeeToken =
      providerData?.datasets?.[0]?.providerFee?.providerFeeToken
    const providerFeeAmount = asset.accessDetails.validProviderFees
      ? '0'
      : providerData?.datasets?.[0]?.providerFee?.providerFeeAmount
    const feeValidity = providerData?.datasets?.[0]?.providerFee?.validUntil

    const feeAmount = await unitsToAmount(
      !isSupportedOceanNetwork || !isAssetNetwork
        ? await getDummySigner(asset?.chainId)
        : signer,
      providerFeeToken,
      providerFeeAmount
    )
    setProviderFeeAmount(feeAmount)

    const datatoken = new Datatoken(await getDummySigner(asset?.chainId))
    setProviderFeesSymbol(await datatoken.getSymbol(providerFeeToken))

    const computeDuration = asset.accessDetails.validProviderFees
      ? asset.accessDetails.validProviderFees.validUntil
      : (parseInt(feeValidity) - Math.floor(Date.now() / 1000)).toString()
    setComputeValidUntil(computeDuration)

    return providerData
  }

  async function setAlgoPrice(algoProviderFees: ProviderFees) {
    if (
      selectedAlgorithmAsset?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
      selectedAlgorithmAsset?.accessDetails?.type !== 'free' &&
      algoProviderFees
    ) {
      const algorithmOrderPriceAndFees = await getOrderPriceAndFees(
        selectedAlgorithmAsset,
        accountId || ZERO_ADDRESS,
        signer,
        algoProviderFees
      )
      if (!algorithmOrderPriceAndFees)
        throw new Error('Error setting algorithm price and fees!')

      setAlgoOrderPriceAndFees(algorithmOrderPriceAndFees)
    }
  }

  async function setDatasetPrice(datasetProviderFees: ProviderFees) {
    if (
      asset?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
      asset?.accessDetails?.type !== 'free' &&
      datasetProviderFees
    ) {
      const datasetPriceAndFees = await getOrderPriceAndFees(
        asset,
        accountId || ZERO_ADDRESS,
        signer,
        datasetProviderFees
      )
      if (!datasetPriceAndFees)
        throw new Error('Error setting dataset price and fees!')

      setDatasetOrderPriceAndFees(datasetPriceAndFees)
    }
  }

  async function initPriceAndFees() {
    try {
      if (!selectedComputeEnv || !selectedComputeEnv.id)
        throw new Error(`Error getting compute environment!`)

      const initializedProvider = await initializeProviderForCompute(
        asset,
        selectedAlgorithmAsset,
        accountId || ZERO_ADDRESS, // if the user is not connected, we use ZERO_ADDRESS as accountId
        selectedComputeEnv
      )

      if (
        !initializedProvider ||
        !initializedProvider?.datasets ||
        !initializedProvider?.algorithm
      )
        throw new Error(`Error initializing provider for the compute job!`)

      setComputeStatusText(
        getComputeFeedback(
          asset.accessDetails?.baseToken?.symbol,
          asset.accessDetails?.datatoken?.symbol,
          asset.metadata.type
        )[0]
      )

      await setDatasetPrice(initializedProvider?.datasets?.[0]?.providerFee)
      setComputeStatusText(
        getComputeFeedback(
          selectedAlgorithmAsset?.accessDetails?.baseToken?.symbol,
          selectedAlgorithmAsset?.accessDetails?.datatoken?.symbol,
          selectedAlgorithmAsset?.metadata?.type
        )[0]
      )

      await setAlgoPrice(initializedProvider?.algorithm?.providerFee)
      const sanitizedResponse = await setComputeFees(initializedProvider)
      setInitializedProviderResponse(sanitizedResponse)
    } catch (error) {
      setError(error.message)
      LoggerInstance.error(`[compute] ${error.message} `)
    }
  }

  useEffect(() => {
    if (!asset?.accessDetails || !accountId || isUnsupportedPricing) return

    logComputeSubmit('setting dataset pricing state', {
      accountId,
      isPurchasable: asset?.accessDetails?.isPurchasable,
      validOrderTx: asset?.accessDetails?.validOrderTx,
      accessDetailsType: asset?.accessDetails?.type
    })

    setIsConsumablePrice(asset?.accessDetails?.isPurchasable)
    setValidOrderTx(asset?.accessDetails?.validOrderTx)
  }, [asset?.accessDetails, accountId, isUnsupportedPricing])

  useEffect(() => {
    if (!selectedAlgorithmAsset?.accessDetails || !selectedComputeEnv) return

    logComputeSubmit('setting algorithm pricing state', {
      selectedAlgorithmAssetId: selectedAlgorithmAsset?.id,
      selectedComputeEnvId: selectedComputeEnv?.id,
      isPurchasable: selectedAlgorithmAsset?.accessDetails?.isPurchasable,
      validOrderTx: selectedAlgorithmAsset?.accessDetails?.validOrderTx,
      accessDetailsType: selectedAlgorithmAsset?.accessDetails?.type
    })

    setIsRequestingAlgoOrderPrice(true)
    setIsConsumableAlgorithmPrice(
      selectedAlgorithmAsset?.accessDetails?.isPurchasable
    )
    setValidAlgorithmOrderTx(
      selectedAlgorithmAsset?.accessDetails?.validOrderTx
    )
    setAlgoOrderPriceAndFees(null)

    async function initSelectedAlgo() {
      await checkAssetDTBalance(selectedAlgorithmAsset)
      await initPriceAndFees()
      setIsRequestingAlgoOrderPrice(false)
    }

    initSelectedAlgo()
  }, [selectedAlgorithmAsset, accountId, selectedComputeEnv])

  useEffect(() => {
    if (!asset?.accessDetails || isUnsupportedPricing) return

    getAlgorithmsForAsset(asset, newCancelToken()).then((algorithmsAssets) => {
      setDdoAlgorithmList(algorithmsAssets)
      getAlgorithmAssetSelectionList(asset, algorithmsAssets, accountId).then(
        (algorithmSelectionList) => {
          setAlgorithmList(algorithmSelectionList)
        }
      )
    })
  }, [accountId, asset, isUnsupportedPricing])

  const initializeComputeEnvironment = useCallback(async () => {
    const computeEnvs = await getComputeEnvironments(
      asset.services[0].serviceEndpoint,
      asset.chainId
    )
    setComputeEnvs(computeEnvs || [])
  }, [asset])

  useEffect(() => {
    initializeComputeEnvironment()
  }, [initializeComputeEnvironment])

  const fetchJobs = useCallback(
    async (type: string) => {
      if (!chainIds || chainIds.length === 0 || !accountId) {
        return
      }

      try {
        type === 'init' && setIsLoadingJobs(true)
        const computeJobs = await getComputeJobs(
          asset?.chainId ? [asset.chainId] : chainIds,
          address,
          asset,
          newCancelToken()
        )
        if (autoWallet) {
          const autoComputeJobs = await getComputeJobs(
            asset?.chainId ? [asset.chainId] : chainIds,
            autoWallet?.address,
            asset,
            newCancelToken()
          )
          autoComputeJobs.computeJobs.forEach((job) => {
            computeJobs.computeJobs.push(job)
          })
        }
        setJobs(computeJobs.computeJobs)
        setIsLoadingJobs(!computeJobs.isLoaded)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoadingJobs(false)
      }
    },
    [address, accountId, asset, chainIds, autoWallet, newCancelToken]
  )

  useEffect(() => {
    fetchJobs('init')

    // init periodic refresh for jobs
    const balanceInterval = setInterval(
      () => fetchJobs('repeat'),
      refreshInterval
    )

    return () => {
      clearInterval(balanceInterval)
    }
  }, [refetchJobs])

  // Output errors in toast UI
  useEffect(() => {
    const newError = error
    if (!newError) return
    const errorMsg = newError + '. Please retry.'
    toast.error(errorMsg)
  }, [error])

  async function getHasDatatokenForAsset(
    targetAsset: AssetExtended
  ): Promise<boolean> {
    if (!targetAsset?.services?.[0]?.datatokenAddress) return false

    logComputeSubmit('checking datatoken balance', {
      targetAssetId: targetAsset?.id,
      datatokenAddress: targetAsset?.services?.[0]?.datatokenAddress,
      chainId: targetAsset?.chainId,
      accountId: accountId || ZERO_ADDRESS
    })

    const dummySigner = await getDummySigner(targetAsset.chainId)
    const datatokenInstance = new Datatoken(dummySigner)
    const dtBalance = await datatokenInstance.balance(
      targetAsset.services[0].datatokenAddress,
      accountId || ZERO_ADDRESS
    )

    logComputeSubmit('datatoken balance resolved', {
      targetAssetId: targetAsset?.id,
      dtBalance,
      hasDatatoken: Number(dtBalance) >= 1
    })

    return Number(dtBalance) >= 1
  }

  async function getTargetDatasetsForCompute(
    selectedDatasetIds: string[]
  ): Promise<AssetExtended[]> {
    logComputeSubmit('resolving target datasets', {
      isAlgorithm,
      selectedDatasetIds,
      baseAssetId: asset?.id
    })

    if (!isAlgorithm) {
      if (!asset?.accessDetails)
        throw new Error('Dataset access details are not available yet.')
      logComputeSubmit('single dataset mode', {
        datasetId: asset?.id,
        hasAccessDetails: !!asset?.accessDetails,
        validOrderTx: asset?.accessDetails?.validOrderTx
      })
      return [asset]
    }

    const selectedIds = selectedDatasetIds?.filter(Boolean) || []
    if (!selectedIds.length) return []

    const datasets = await getAssetsFromDids(
      selectedIds,
      [asset.chainId],
      newCancelToken()
    )

    logComputeSubmit('datasets loaded from dids', {
      requestedCount: selectedIds.length,
      foundCount: datasets?.length || 0,
      datasetIds: datasets?.map((dataset) => dataset.id)
    })

    if (!datasets?.length) return []

    const extendedDatasets = await Promise.all(
      datasets.map(async (dataset) => {
        const accessDetails = await getAccessDetails(
          dataset.chainId,
          dataset.services[0].datatokenAddress,
          dataset.services[0].timeout,
          accountId || ZERO_ADDRESS
        )

        return {
          ...dataset,
          accessDetails
        } as AssetExtended
      })
    )

    logComputeSubmit('datasets enriched with accessDetails', {
      datasetIds: extendedDatasets.map((dataset) => dataset.id),
      accessDetailsStatus: extendedDatasets.map((dataset) => ({
        id: dataset.id,
        hasAccessDetails: !!dataset?.accessDetails,
        validOrderTx: dataset?.accessDetails?.validOrderTx,
        type: dataset?.accessDetails?.type
      }))
    })

    const datasetsWithoutAccessDetails = extendedDatasets.filter(
      (dataset) => !dataset?.accessDetails
    )
    if (datasetsWithoutAccessDetails.length > 0)
      throw new Error(
        `Dataset access details are unavailable for: ${datasetsWithoutAccessDetails
          .map((dataset) => dataset.id)
          .join(', ')}`
      )

    return extendedDatasets
  }

  async function getSelectedAlgorithmForCompute(): Promise<AssetExtended> {
    if (!selectedAlgorithmAsset)
      throw new Error('Please select a valid algorithm.')

    if (selectedAlgorithmAsset?.accessDetails) return selectedAlgorithmAsset

    logComputeSubmit('hydrating selected algorithm accessDetails', {
      selectedAlgorithmAssetId: selectedAlgorithmAsset.id,
      chainId: selectedAlgorithmAsset.chainId
    })

    const accessDetails = await getAccessDetails(
      selectedAlgorithmAsset.chainId,
      selectedAlgorithmAsset.services[0].datatokenAddress,
      selectedAlgorithmAsset.services[0].timeout,
      accountId || ZERO_ADDRESS
    )

    if (!accessDetails)
      throw new Error(
        `Algorithm access details are unavailable for ${selectedAlgorithmAsset.id}.`
      )

    const hydratedAlgorithmAsset = {
      ...selectedAlgorithmAsset,
      accessDetails
    } as AssetExtended

    setSelectedAlgorithmAsset(hydratedAlgorithmAsset)
    setIsConsumableAlgorithmPrice(accessDetails?.isPurchasable)
    setValidAlgorithmOrderTx(accessDetails?.validOrderTx || '')

    logComputeSubmit('selected algorithm accessDetails hydrated', {
      selectedAlgorithmAssetId: hydratedAlgorithmAsset.id,
      validOrderTx: hydratedAlgorithmAsset?.accessDetails?.validOrderTx,
      accessDetailsType: hydratedAlgorithmAsset?.accessDetails?.type
    })

    return hydratedAlgorithmAsset
  }

  async function startJob(
    userCustomParameters: {
      dataServiceParams?: UserCustomParameters
      algoServiceParams?: UserCustomParameters
      algoParams?: UserCustomParameters
    },
    selectedDatasetIds: string[]
  ): Promise<void> {
    try {
      setIsOrdering(true)
      setIsOrdered(false)
      setError(undefined)

      logComputeSubmit('startJob called', {
        accountId,
        selectedAlgorithmAssetId: selectedAlgorithmAsset?.id,
        selectedComputeEnvId: selectedComputeEnv?.id,
        selectedDatasetIds,
        userCustomParameters
      })

      if (!selectedAlgorithmAsset)
        throw new Error('Please select a valid algorithm.')
      if (!selectedComputeEnv?.id)
        throw new Error('Please select a compute environment.')

      const selectedAlgorithm = await getSelectedAlgorithmForCompute()

      const targetDatasets = await getTargetDatasetsForCompute(
        selectedDatasetIds
      )

      logComputeSubmit('target datasets resolved', {
        count: targetDatasets.length,
        datasetIds: targetDatasets.map((dataset) => dataset.id)
      })

      if (!targetDatasets.length)
        throw new Error('No datasets selected for compute job.')

      const computeAlgorithm: ComputeAlgorithm = {
        documentId: selectedAlgorithm.id,
        serviceId: selectedAlgorithm.services[0].id,
        algocustomdata: userCustomParameters?.algoParams,
        userdata: userCustomParameters?.algoServiceParams
      }

      const primaryServiceEndpoint =
        targetDatasets[0]?.services?.[0]?.serviceEndpoint
      const hasMultipleProviders = targetDatasets.some(
        (dataset) =>
          dataset?.services?.[0]?.serviceEndpoint !== primaryServiceEndpoint
      )

      logComputeSubmit('provider endpoint validation', {
        primaryServiceEndpoint,
        hasMultipleProviders,
        providers: targetDatasets.map(
          (dataset) => dataset?.services?.[0]?.serviceEndpoint
        )
      })

      if (hasMultipleProviders)
        throw new Error(
          'All selected datasets must use the same provider endpoint to run in one compute job.'
        )

      const hasAlgoDt = await getHasDatatokenForAsset(selectedAlgorithm)

      logComputeSubmit('algorithm datatoken status', {
        selectedAlgorithmAssetId: selectedAlgorithm.id,
        hasAlgoDt,
        validOrderTx: selectedAlgorithm?.accessDetails?.validOrderTx
      })

      let algorithmOrderTx: string
      const computeAssets: ComputeAsset[] = []

      for (let i = 0; i < targetDatasets.length; i++) {
        const targetDataset = targetDatasets[i]
        logComputeSubmit('processing dataset for ordering', {
          index: i,
          datasetId: targetDataset?.id,
          datasetType: targetDataset?.accessDetails?.type,
          validOrderTx: targetDataset?.accessDetails?.validOrderTx
        })

        if (!targetDataset?.accessDetails)
          throw new Error(
            `Dataset access details are unavailable for ${targetDataset.id}.`
          )
        const computeService = getServiceByName(targetDataset, 'compute')
        if (!computeService)
          throw new Error(
            `Compute service missing for dataset ${targetDataset.id}.`
          )

        const allowed = await isOrderable(
          targetDataset,
          computeService.id,
          computeAlgorithm,
          selectedAlgorithm
        )

        logComputeSubmit('isOrderable result', {
          datasetId: targetDataset.id,
          computeServiceId: computeService.id,
          allowed
        })

        if (!allowed)
          throw new Error(
            `Dataset ${targetDataset.id} is not orderable with selected algorithm.`
          )

        console.log('Dataset extended:', targetDataset)
        console.log('Algorithm extended:', selectedAlgorithm)

        const initializedProvider = await initializeProviderForCompute(
          targetDataset,
          selectedAlgorithm,
          accountId || ZERO_ADDRESS,
          selectedComputeEnv
        )

        logComputeSubmit('provider initialized for dataset', {
          datasetId: targetDataset.id,
          hasInitializedProvider: !!initializedProvider,
          hasDatasets: !!initializedProvider?.datasets,
          hasAlgorithm: !!initializedProvider?.algorithm
        })

        if (
          !initializedProvider ||
          !initializedProvider?.datasets ||
          !initializedProvider?.algorithm
        ) {
          throw new Error(
            `Error initializing provider for dataset ${targetDataset.id}.`
          )
        }

        if (!algorithmOrderTx) {
          let currentAlgoOrderPriceAndFees: OrderPriceAndFees
          if (
            selectedAlgorithm?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
            selectedAlgorithm?.accessDetails?.type !== 'free' &&
            initializedProvider?.algorithm?.providerFee
          ) {
            currentAlgoOrderPriceAndFees = await getOrderPriceAndFees(
              selectedAlgorithm,
              accountId || ZERO_ADDRESS,
              signer,
              initializedProvider.algorithm.providerFee
            )

            logComputeSubmit('algorithm order price calculated', {
              selectedAlgorithmAssetId: selectedAlgorithm.id,
              hasOrderPriceAndFees: !!currentAlgoOrderPriceAndFees
            })
          }

          setComputeStatusText(
            getComputeFeedback(
              selectedAlgorithm.accessDetails?.baseToken?.symbol,
              selectedAlgorithm.accessDetails?.datatoken?.symbol,
              selectedAlgorithm.metadata.type
            )[selectedAlgorithm.accessDetails?.type === 'fixed' ? 2 : 3]
          )

          algorithmOrderTx = await handleComputeOrder(
            signer,
            selectedAlgorithm,
            currentAlgoOrderPriceAndFees,
            accountId,
            initializedProvider.algorithm,
            hasAlgoDt,
            selectedComputeEnv.consumerAddress
          )

          logComputeSubmit('algorithm order tx result', {
            selectedAlgorithmAssetId: selectedAlgorithm.id,
            algorithmOrderTx
          })

          if (!algorithmOrderTx) throw new Error('Failed to order algorithm.')
        }

        let currentDatasetOrderPriceAndFees: OrderPriceAndFees
        if (
          targetDataset?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
          targetDataset?.accessDetails?.type !== 'free' &&
          initializedProvider?.datasets?.[0]?.providerFee
        ) {
          currentDatasetOrderPriceAndFees = await getOrderPriceAndFees(
            targetDataset,
            accountId || ZERO_ADDRESS,
            signer,
            initializedProvider.datasets[0].providerFee
          )

          logComputeSubmit('dataset order price calculated', {
            datasetId: targetDataset.id,
            hasOrderPriceAndFees: !!currentDatasetOrderPriceAndFees
          })
        }

        const datasetHasDatatoken =
          targetDataset.id === asset.id
            ? hasDatatoken
            : await getHasDatatokenForAsset(targetDataset)

        logComputeSubmit('dataset datatoken status', {
          datasetId: targetDataset.id,
          datasetHasDatatoken,
          validOrderTx: targetDataset?.accessDetails?.validOrderTx
        })

        setComputeStatusText(
          getComputeFeedback(
            targetDataset.accessDetails?.baseToken?.symbol,
            targetDataset.accessDetails?.datatoken?.symbol,
            targetDataset.metadata.type
          )[targetDataset.accessDetails?.type === 'fixed' ? 2 : 3]
        )

        const datasetOrderTx = await handleComputeOrder(
          signer,
          targetDataset,
          currentDatasetOrderPriceAndFees,
          accountId,
          initializedProvider.datasets[0],
          datasetHasDatatoken,
          selectedComputeEnv.consumerAddress
        )

        logComputeSubmit('dataset order tx result', {
          datasetId: targetDataset.id,
          datasetOrderTx
        })

        if (!datasetOrderTx) throw new Error('Failed to order dataset.')

        computeAssets.push({
          documentId: targetDataset.id,
          serviceId: targetDataset.services[0].id,
          transferTxId: datasetOrderTx,
          userdata: userCustomParameters?.dataServiceParams
        })

        logComputeSubmit('dataset appended to computeAssets payload', {
          datasetId: targetDataset.id,
          computeAssetsCount: computeAssets.length,
          computeAssetsSummary: computeAssets.map(summarizeComputeAsset)
        })
      }

      if (!computeAssets.length)
        throw new Error('No dataset payload created for compute start.')

      computeAlgorithm.transferTxId = algorithmOrderTx
      const output: ComputeOutput = {
        publishAlgorithmLog: true,
        publishOutput: true
      }

      const [primaryDatasetAsset, ...additionalDatasets] = computeAssets

      setComputeStatusText(getComputeFeedback()[4])

      logComputeSubmit('compute assets split for computeStart', {
        totalComputeAssets: computeAssets.length,
        primaryDatasetAsset: summarizeComputeAsset(primaryDatasetAsset),
        additionalDatasetsCount: additionalDatasets.length,
        additionalDatasets: additionalDatasets.map(summarizeComputeAsset)
      })

      logComputeSubmit('starting compute job', {
        computeEnvId: selectedComputeEnv.id,
        providerEndpoint: targetDatasets[0].services[0].serviceEndpoint,
        primaryDatasetId: primaryDatasetAsset?.documentId,
        additionalDatasetsCount: additionalDatasets.length,
        additionalDatasetIds: additionalDatasets.map(
          (computeAsset) => computeAsset.documentId
        ),
        algorithmId: computeAlgorithm.documentId,
        algorithmOrderTx,
        output
      })

      const response = await ProviderInstance.computeStart(
        targetDatasets[0].services[0].serviceEndpoint,
        signer,
        selectedComputeEnv.id,
        primaryDatasetAsset,
        computeAlgorithm,
        newAbortController(),
        additionalDatasets.length > 0 ? additionalDatasets : undefined,
        output
      )
      if (!response) throw new Error('Error starting compute job.')

      logComputeSubmit('compute start response', response)
      logComputeSubmit('compute start response summary', {
        responseType: Array.isArray(response) ? 'array' : typeof response,
        responseLength: Array.isArray(response) ? response.length : undefined,
        responseKeys:
          response && typeof response === 'object' ? Object.keys(response) : []
      })

      LoggerInstance.log('[compute] Starting compute job response: ', response)

      setIsOrdered(true)
      setRefetchJobs(!refetchJobs)
      initPriceAndFees()
    } catch (error) {
      logComputeSubmit('startJob failed', {
        message: error?.message,
        stack: error?.stack,
        error
      })

      const message = getErrorMessage(error.message)
      LoggerInstance.error('[Compute] Error:', message)
      setError(message)
      setRetry(true)
    } finally {
      logComputeSubmit('startJob finished', {
        isOrdering: false
      })
      setIsOrdering(false)
    }
  }

  const onSubmit = async (values: ComputeDatasetForm) => {
    logComputeSubmit('form submit values', values)
    logComputeSubmit('selected datasets on submit', values.selectedDatasets)

    const userCustomParameters = {
      dataServiceParams: parseConsumerParameterValues(
        values?.dataServiceParams,
        asset.services[0].consumerParameters
      ),
      algoServiceParams: parseConsumerParameterValues(
        values?.algoServiceParams,
        selectedAlgorithmAsset?.services[0].consumerParameters
      ),
      algoParams: parseConsumerParameterValues(
        values?.algoParams,
        selectedAlgorithmAsset?.metadata?.algorithm?.consumerParameters
      )
    }

    logComputeSubmit('parsed user custom parameters', userCustomParameters)

    await startJob(userCustomParameters, values.selectedDatasets)
  }

  return (
    <>
      <div
        className={`${styles.info} ${
          isUnsupportedPricing ? styles.warning : null
        }`}
      >
        <FileIcon
          file={file}
          isAccountWhitelisted={isAccountIdWhitelisted}
          isLoading={fileIsLoading}
          small
        />
        {isUnsupportedPricing ? (
          <Alert
            text={`No pricing schema available for this asset.`}
            state="info"
          />
        ) : (
          <Price
            price={price}
            orderPriceAndFees={datasetOrderPriceAndFees}
            size="large"
          />
        )}
      </div>

      {isUnsupportedPricing || !accountId ? null : (
        <>
          <Formik
            initialValues={getInitialValues(
              asset,
              selectedAlgorithmAsset,
              selectedComputeEnv,
              false, // intial assetTermsAndConditions checkbox always false
              false // intial portalTermsAndConditions checkbox always false
            )}
            validateOnMount
            validationSchema={getComputeValidationSchema(
              asset.services[0].consumerParameters,
              selectedAlgorithmAsset?.services[0].consumerParameters,
              selectedAlgorithmAsset?.metadata?.algorithm?.consumerParameters,
              isAlgorithm
            )}
            enableReinitialize
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue }) => (
              <FormStartComputeDataset
                algorithms={algorithmList}
                ddoListAlgorithms={ddoAlgorithmList}
                selectedAlgorithmAsset={selectedAlgorithmAsset}
                setSelectedAlgorithm={setSelectedAlgorithmAsset}
                isLoading={isOrdering || isRequestingAlgoOrderPrice}
                isComputeButtonDisabled={isComputeButtonDisabled}
                hasPreviousOrder={!!validOrderTx}
                hasDatatoken={hasDatatoken}
                dtBalance={dtBalance}
                assetType={asset?.metadata.type}
                assetTimeout={secondsToString(asset?.services[0].timeout)}
                hasPreviousOrderSelectedComputeAsset={!!validAlgorithmOrderTx}
                hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                isAccountIdWhitelisted={isAccountIdWhitelisted}
                datasetSymbol={
                  asset?.accessDetails?.baseToken?.symbol || defaultTokenSymbol
                }
                algorithmSymbol={
                  selectedAlgorithmAsset?.accessDetails?.baseToken?.symbol ||
                  defaultTokenSymbol
                }
                providerFeesSymbol={providerFeesSymbol}
                dtSymbolSelectedComputeAsset={
                  selectedAlgorithmAsset?.datatokens[0]?.symbol
                }
                dtBalanceSelectedComputeAsset={algorithmDTBalance}
                selectedComputeAssetType="algorithm"
                selectedComputeAssetTimeout={secondsToString(
                  selectedAlgorithmAsset?.services[0]?.timeout
                )}
                computeEnvs={computeEnvs}
                setSelectedComputeEnv={setSelectedComputeEnv}
                // lazy comment when removing pricingStepText
                stepText={computeStatusText}
                isConsumable={isConsumablePrice}
                consumableFeedback={consumableFeedback}
                datasetOrderPriceAndFees={datasetOrderPriceAndFees}
                algoOrderPriceAndFees={algoOrderPriceAndFees}
                providerFeeAmount={providerFeeAmount}
                validUntil={computeValidUntil}
                retry={retry}
                license={asset?.metadata?.license}
                showAlgorithmField={!isAlgorithm}
              >
                {isAlgorithm && (
                  <AssetComputeSelectionSearch
                    algorithmDid={asset.id}
                    asset={asset}
                    selectedDatasets={values.selectedDatasets || []}
                    setSelectedDatasets={(datasets) =>
                      setFieldValue('selectedDatasets', datasets)
                    }
                  />
                )}
              </FormStartComputeDataset>
            )}
          </Formik>
        </>
      )}

      <footer className={styles.feedback}>
        {isOrdered && (
          <SuccessConfetti success="Your job started successfully! Watch the progress below or on your profile." />
        )}
      </footer>
      {accountId && (
        <WhitelistIndicator
          accountId={accountId}
          isAccountIdWhitelisted={isAccountIdWhitelisted}
        />
      )}
      {accountId && asset?.accessDetails?.datatoken && (
        <ComputeHistory
          title="Your Compute Jobs"
          refetchJobs={() => setRefetchJobs(!refetchJobs)}
        >
          <ComputeJobs
            minimal
            jobs={jobs}
            isLoading={isLoadingJobs}
            refetchJobs={() => setRefetchJobs(!refetchJobs)}
          />
        </ComputeHistory>
      )}
    </>
  )
}
