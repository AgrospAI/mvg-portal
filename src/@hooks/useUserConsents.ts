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

    try {
      // 2. Try to estimate gas with a 20% buffer
      const estimatedGas = await contract.estimateGas.vote(...args)
      const gasLimit = estimatedGas.mul(120).div(100)

      const tx = await contract.vote(...args, { gasLimit })
      await tx.wait()
    } catch (error) {
      LoggerInstance.warn('Estimation failed, manual limit', error)
      const tx = await contract.vote(...args, { gasLimit: 400_000 })
      await tx.wait()
    }
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

    try {
      const estimatedGas = await contract.estimateGas.createRequest(args)
      const gasLimit = estimatedGas.mul(120).div(100)

      const tx = await contract.createRequest(args, { gasLimit })
      await tx.wait()
    } catch (error) {
      console.warn('Estimation failed, manual limit', error)
      const tx = await contract.createRequest(args, {
        gasLimit: 1_000_000
      })
      await tx.wait()
    }
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
