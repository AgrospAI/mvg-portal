const PONTUSX_ADDRESSES = require('./pontusxAddresses.json')

module.exports = {
  whitelists: {
    'nft.owner': [],
    'datatokens.address': []
  },
  featured: [
    {
      title: 'AI-based Animal Well-being Assessment without Images Leakage',
      assets: [
        // Mask R-CNN segmentation & Tracking
        'did:op:2c0e29e89bee015cbbbaa46ce7f9a566a2cb541367bca926c5552a1b2d697892',
        // CEP Pigs Images
        'did:op:31d6d1ea0fc540e1ea6e5268ebfd53e8129992cd6971dfbbbd0b88b08ca6f939'
      ]
    },
    {
      title:
        'Precision Pig Feeding Semantic Data Integration and Sovereign Data Pooling',
      assets: [
        // CEP's CSV Data Mapper and Semantic Data Pooler
        'did:op:d20f956e79709fb2469fffe2bd85cf2fec95a21d2497998bb530043c6bbec901',
        // CEP Pigs Feeding Data
        'did:op:f7946c46eb87318b2cd34efdd5f33b19ea9223a90b67f447da6a92aa68ca007c',
        // Exploratory Data Analysis
        'did:op:34d5f73d77550843201ee1a43ad9d404d3e557ed6a70772e9afde7a27d863b8f'
      ]
    }
  ],
  verifiedAddresses: PONTUSX_ADDRESSES
}
