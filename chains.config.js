// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const chains = [
  {
    chainId: 32456,
    isDefault: false,
    isCustom: true,
    network: 'pontusx-devnet',
    oceanTokenSymbol: 'OCEAN',
    oceanTokenAddress: '0xdF171F74a8d3f4e2A789A566Dce9Fa4945196112',
    nftFactoryAddress: '0xFdC4a5DEaCDfc6D82F66e894539461a269900E13',
    fixedRateExchangeAddress: '0x8372715D834d286c9aECE1AcD51Da5755B32D505',
    dispenserAddress: '0x5461b629E01f72E0A468931A36e039Eea394f9eA',
    opfCommunityFeeCollector: '0x1f84fB438292269219f9396D57431eA9257C23d4',
    startBlock: 57428,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://provider.agrospai.udl.cat',
    providerAddress: '0x94549951623DD6c3265DBbB1b032d6cF48Ba7811',
    metadataCacheUri: 'https://aquarius.pontus-x.eu',
    nodeUri: 'https://rpc.dev.pontus-x.eu',
    subgraphUri: 'https://subgraph.dev.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu/pontusx/dev'
  },
  {
    chainId: 32457,
    isDefault: false,
    isCustom: true,
    network: 'pontusx-testnet',
    oceanTokenSymbol: 'OCEAN',
    oceanTokenAddress: '0x5B190F9E2E721f8c811E4d584383E3d57b865C69',
    nftFactoryAddress: '0x2C4d542ff791890D9290Eec89C9348A4891A6Fd2',
    fixedRateExchangeAddress: '0xcE0F39abB6DA2aE4d072DA78FA0A711cBB62764E',
    dispenserAddress: '0xaB5B68F88Bc881CAA427007559E9bbF8818026dE',
    opfCommunityFeeCollector: '0xACC8d1B2a0007951fb4ed622ACB1C4fcCAbe778D',
    startBlock: 82191,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://provider.agrospai.udl.cat',
    providerAddress: '0x94549951623DD6c3265DBbB1b032d6cF48Ba7811',
    metadataCacheUri: 'https://aquarius.pontus-x.eu',
    nodeUri: 'https://rpc.test.pontus-x.eu',
    subgraphUri: 'https://subgraph.test.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu/pontusx/test'
  },
  {
    chainId: 8996,
    isDefault: true,
    isCustom: true,
    network: 'development',
    oceanTokenSymbol: 'OCEAN',
    oceanTokenAddress: '0xB2106512Eb5580CEC30cf1e7Fe6b9719e603386e',
    nftFactoryAddress: '0x27658bB25Eb64485092E6d223fFA84E829270CE9',
    fixedRateExchangeAddress: '0xa8C01293358F5cbbEB690222C888221A6eef0E4B',
    dispenserAddress: '0x716bf3c04DdE3474eFf0533D93483b1709C3642c',
    opfCommunityFeeCollector: '0x62be228dA1E5f874EE5d6A81028f87f9F107641B',
    startBlock: 0,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    // Will only work with dockerized app
    providerUri: 'http://host.docker.internal:8030',
    providerAddress: '0xe2DD09d719Da89e5a3D0F2549c7E24566e947260',
    metadataCacheUri: 'http://host.docker.internal:10000',
    nodeUri: 'http://host.docker.internal:8545',
    subgraphUri: 'http://host.docker.internal:9000',
    explorerUri: 'http://host.docker.internal:25000'
  },
  {
    chainId: 11155111,
    isDefault: true,
    isCustom: true,
    network: 'sepolia-test',
    oceanTokenSymbol: 'ETH',
    oceanTokenAddress: '0x1B083D8584dd3e6Ff37d04a6e7e82b5F622f3985',
    nftFactoryAddress: '0x9D6F7e4B5E655F4bba7c9BAdc466Fc35d6A3E3f8',
    fixedRateExchangeAddress: '0x69B71C7991B9A8479Fd21a8A06C2E98251B27B7D',
    dispenserAddress: '0x25B5Cb14A7C4B5D814B77f8Ea4e12Ab7f22d1b60',
    opfCommunityFeeCollector: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://v4.provider.sepolia.oceanprotocol.com',
    providerAddress: '0x0000000000000000000000000000000000000000',
    metadataCacheUri: 'https://v4.aquarius.oceanprotocol.com',
    nodeUri: 'http://localhost:8545',
    subgraphUri: 'https://v4.subgraph.sepolia.oceanprotocol.com',
    explorerUri: 'https://sepolia.etherscan.io'
  }
]

const getDefaultChainIds = () => {
  return chains.filter((chain) => chain.isDefault).map((c) => c.chainId)
}

const getSupportedChainIds = () => {
  return chains.map((c) => c.chainId)
}

const getCustomChainIds = () => {
  return chains.filter((c) => c.isCustom).map((c) => c.chainId)
}

module.exports = {
  chains,
  getDefaultChainIds,
  getSupportedChainIds,
  getCustomChainIds
}
