import Data from '.well-known.json'
import { Address } from 'wagmi'

export const useVerifiableCredentials = (address: Address) => {
  const credentials: string[] = Data?.[address] ?? []

  return {
    data: credentials
  }
}
