interface MetadataSubRequest {
  id: string
  requestType: number
  data: string
  yesWeight: string
  noWeight: string
}

interface MetadataRequestNft {
  id: string
  name: string
  owner: { id: string }
  providerUrl: string
}

interface MetadataRequestVote {
  voter: string
  inFavourBitmap: number
  weight: string
  data: string
}

interface MetadataRequest {
  id: number
  datasetAddress: MetadataRequestNft
  algorithmAddress: MetadataRequestNft
  status: number
  createdAt: number
  decidedAt: number | null
  expiresAt: number
  requester: string
  reason: string
  subRequests?: MetadataSubRequest[]
  votes?: MetadataRequestVote[]
}

interface AssetData {
  did: string
  name: string
  chainId: number
}

interface ExtendedMetadataRequest extends MetadataRequest {
  dataset?: AssetData
  algorithm?: AssetData
}
