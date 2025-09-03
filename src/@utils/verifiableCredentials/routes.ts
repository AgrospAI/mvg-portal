import { Address } from 'wagmi'

export const CredentialRoutes = {
  GetCredentials: (address: Address) => `credentials/${address}`
}
