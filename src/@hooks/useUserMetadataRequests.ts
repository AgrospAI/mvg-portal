import { FormResponse } from '@components/Profile/History/Consents/Modal/Components/ConsentResponse/index.hooks'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getContract } from '@utils/contracts'
import { ethers } from 'ethers'
import { useNetwork } from 'wagmi'
import { useAutoSigner } from './useAutoSigner'

export const useContract = (contractName: string) => {
  const { chain } = useNetwork()
  const { signer } = useAutoSigner()

  const getContractInstance = () => {
    if (!signer) throw new Error('No signer available')
    if (!chain?.id) throw new Error('No chain connected')
    return getContract(contractName, chain.id, signer)
  }

  return { getContractInstance }
}

const useMetadataRequestManager = () => useContract('MetadataRequestManager')

const callEstimatingGas = async (
  contract: ethers.Contract,
  func: string,
  args: any[],
  unwind: boolean = true,
  fallbackGas: ethers.BigNumber = ethers.BigNumber.from(500_000)
) => {
  const addBuffer = (n: ethers.BigNumber) => n.mul(120).div(100)

  const estimateGas = async () =>
    unwind
      ? await contract.estimateGas[func](...args)
      : await contract.estimateGas[func](args)

  const call = async (gasLimit: ethers.BigNumber) =>
    unwind
      ? await contract[func](...args, { gasLimit })
      : await contract[func](args, { gasLimit })

  const isUserRejection = (error) =>
    error?.code === 4001 || error?.code === 'ACTION_REJECTED'

  return await estimateGas()
    .then(addBuffer)
    .then(call)
    .then((tx) => tx.wait())
    .catch(async (error) => {
      if (isUserRejection(error)) throw error

      LoggerInstance.warn('Estimation failed, manual limit', error)
      return call(fallbackGas).then((tx) => tx.wait())
    })
}

export const useVoteMetadataRequest = () => {
  const { getContractInstance } = useMetadataRequestManager()

  const voteMetadataRequest = async ({
    requestId,
    response
  }: {
    requestId: number
    response: FormResponse
  }): Promise<void> => {
    const inFavourBitmap = response.permissions.reduce((bitmap, permission) => {
      if (permission.permitted) {
        const bitValue = BigInt(1) << BigInt(permission.requestType)
        return bitmap | bitValue
      }
      return bitmap
    }, BigInt(0))

    const contract = getContractInstance()
    const args = [BigInt(requestId), inFavourBitmap, response.reason || '']
    LoggerInstance.log('Sending vote', ...args)

    await callEstimatingGas(
      contract,
      'vote',
      args,
      true,
      ethers.BigNumber.from(400_000)
    )
  }

  return { voteMetadataRequest }
}

export const useCreateAssetMetadataRequest = () => {
  const { getContractInstance } = useMetadataRequestManager()

  const createAssetMetadataRequest = async ({
    datasetAddress,
    algorithmAddress,
    reason,
    requestTypes,
    data,
    expiresIn
  }: {
    datasetAddress: string
    algorithmAddress: string
    reason: string
    requestTypes: number[]
    data: string[]
    expiresIn: number
  }): Promise<void> => {
    const contract = getContractInstance()
    const args = [
      datasetAddress,
      algorithmAddress,
      reason,
      requestTypes,
      data,
      expiresIn
    ]
    console.log('Sending metadata creation request', ...args)

    await callEstimatingGas(
      contract,
      'createRequest',
      args,
      false,
      ethers.BigNumber.from(1_000_000)
    )
  }

  return { createAssetMetadataRequest }
}

export const useDeleteMetadataRequest = () => {
  const { getContractInstance } = useMetadataRequestManager()

  const deleteMetadataRequest = async ({
    requestId
  }: {
    requestId: ethers.BigNumber | number
  }): Promise<void> => {
    LoggerInstance.log(`Deleting metadata request: ${requestId}`)

    const contract = getContractInstance()
    const tx = await contract.cancelRequest(requestId)
    await tx.wait()
  }

  return { deleteMetadataRequest }
}

export const useFinalizeMetadataRequest = () => {
  const { getContractInstance } = useMetadataRequestManager()

  const finalizeMetadataRequest = async ({
    requestId
  }: {
    requestId: ethers.BigNumber | number
  }) => {
    LoggerInstance.log(`Finalizing metadata request: ${requestId}`)

    const contract = getContractInstance()
    const tx = await contract.finalize(requestId)
    await tx.wait()
  }

  return { finalizeMetadataRequest }
}

export const useGetMaximumExpireTime = () => {
  const { getContractInstance } = useMetadataRequestManager()

  const getExpireTime = async (): Promise<number> => {
    const contract = getContractInstance()
    const value = await contract.MAX_EXPIRE_DURATION()
    return value.toNumber()
  }

  return { getExpireTime }
}
