import { ethers } from 'ethers'

import addresses from '@/address.json'
import MetadataRequestManagerABI from '@/contracts/utils/MetadataRequestManager.sol/MetadataRequestManager.json'

const ABI_MAP = {
  MetadataRequestManager: MetadataRequestManagerABI.abi
}

const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  8996: 'development',
  32456: 'pontus-x-devnet',
  32457: 'pontus-x-testnet'
}

export const getContractAddress = (
  chainId: number,
  contractName: string
): string => {
  const network = CHAIN_ID_TO_NETWORK[chainId]
  if (!network) throw new Error(`Unsupported chainId: ${chainId}`)

  const networkAddresses = addresses[network]
  const address = networkAddresses[contractName]
  if (!address)
    throw new Error(`Contract ${contractName} not found on network ${network}`)

  return address
}

export const getContract = (
  contractName: string,
  chainId: number,
  signer: ethers.Signer
): ethers.Contract => {
  const address = getContractAddress(chainId, contractName)
  const abi = ABI_MAP[contractName]
  if (!abi) throw new Error(`ABI for ${contractName} not found`)

  return new ethers.Contract(address, abi, signer)
}
