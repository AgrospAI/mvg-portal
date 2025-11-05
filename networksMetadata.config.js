// networks metadata to add to EVM-based Chains list
// see: https://github.com/ethereum-lists/chains

const networksMetadata = [
  {
    chainId: 32456,
    networkId: 32456,
    name: 'Pontus-X Devnet',
    chain: 'Pontus-X',
    rpc: ['https://rpc.dev.pontus-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'EURAU',
      symbol: 'EURAU',
      decimals: 6
    },
    infoURL: 'https://docs.pontus-x.eu',
    shortName: 'Pontus-X',
    explorers: [
      {
        name: 'Pontus-X Devnet Explorer',
        url: 'https://explorer.pontus-x.eu/pontusx/dev',
        standard: ''
      }
    ]
  },
  {
    chainId: 32457,
    networkId: 32457,
    name: 'Pontus-X Testnet',
    chain: 'Pontus-X',
    rpc: ['https://rpc.test.pontus-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'EURAU',
      symbol: 'EURAU',
      decimals: 6
    },
    infoURL: 'https://docs.pontus-x.eu',
    shortName: 'Pontus-X',
    explorers: [
      {
        name: 'Pontus-X Testnet Explorer',
        url: 'https://explorer.pontus-x.eu/pontusx/test',
        standard: ''
      }
    ]
  },
  {
    chainId: 8996,
    networkId: 8996,
    name: 'Local Network',
    chain: 'Ganache',
    rpc: ['http://localhost:8545'],
    faucets: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    infoURL: 'https://docs.pontus-x.eu',
    shortName: 'Local',
    explorers: [
      {
        name: 'Local Network Explorer',
        url: 'http://localhost',
        standard: ''
      }
    ]
  },
  {
    chainId: 11155111,
    networkId: 11155111,
    name: 'Sepolia Testnet',
    chain: 'Sepolia',
    rpc: ['wss://sepolia.drpc.org'],
    faucets: [],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    infoURL: 'https://docs.pontus-x.eu',
    shortName: 'Sepolia',
    explorers: [
      {
        name: 'Sepolia Explorer',
        url: 'https://sepolia.etherscan.io',
        standard: ''
      }
    ]
  }
]

module.exports = {
  networksMetadata
}
