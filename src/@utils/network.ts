import { networksMetadata } from 'networksMetadata.config'

/**
 *  Switches the user's wallet to the specified Pontus-X network.
 * @param chainId - 32456 for Devnet, 32457 for Testnet
 */
export async function switchToAssetNetwork(chainId: number) {
  if (!window.ethereum) throw new Error('No Web3 wallet detected')

  const network = networksMetadata.find((n) => n.chainId === chainId)
  if (!network)
    throw new Error(`Network metadata not found for chainId ${chainId}`)

  const hexChainId = '0x' + network.chainId.toString(16)

  try {
    // Try switching
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }]
    })
    console.log(
      `Switched to network: ${network.name} (chainId ${network.chainId})`
    )
  } catch (switchError: any) {
    // If the network is not added, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: network.rpc,
            blockExplorerUrls: network.explorers?.map((e) => e.url) || []
          }
        ]
      })
      console.log(
        `Added and switched to network: ${network.name} (chainId ${network.chainId})`
      )
    } else {
      throw switchError
    }
  }
}
