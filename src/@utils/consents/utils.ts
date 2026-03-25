import { getAddress } from 'ethers/lib/utils.js'

export const MetadataRequestTypes = 3

export function extractDidFromUrl(url: string): string | null {
  const match = url.match(/did:[^/]+/)
  return match ? match[0] : null
}

const compareAddresses = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()

export const isPending = (request: MetadataRequest) => request.status === 0

export const isIncoming = (request: MetadataRequest, forUser: string) =>
  compareAddresses(request.datasetAddress.owner.id, forUser)

export const isOutgoing = (request: MetadataRequest, forUser: string) =>
  compareAddresses(request.requester, forUser)

export const isFinished = (request: MetadataRequest) => {
  const nowInSeconds = Math.floor(Date.now() / 1000)
  return request.expiresAt < nowInSeconds
}

export const getUserVote = (votes: MetadataRequestVote[], address: string) =>
  votes.find((v) => compareAddresses(v.voter, address))

const didCache = new Map<string, string>()

export async function makeDid(
  chainId: number | string,
  nftAddress: string
): Promise<string> {
  const key = `${chainId}-${nftAddress}`
  if (didCache.has(key)) {
    return didCache.get(key)
  }

  const checksummedAddr = getAddress(nftAddress)

  const inputString = checksummedAddr + chainId.toString()
  const encoder = new TextEncoder()
  const data = encoder.encode(inputString)

  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert buffer to hex string (equivalent to remove_0x_prefix and Web3.to_hex)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const did = `did:op:${hashHex}`
  if (did) didCache.set(key, did)

  return did
}
