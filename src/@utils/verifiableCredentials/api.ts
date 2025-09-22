import axios from 'axios'
import { Address } from 'wagmi'
import { CredentialRoutes } from './routes'
import { PontusVerifiableCredentialArray } from './types'

const API = axios.create({
  baseURL: '/api',
  timeout: 2000
})

export const getAddressCredentials = async (
  address: Address,
  signal?: AbortSignal
): Promise<PontusVerifiableCredentialArray> =>
  address
    ? API.get(CredentialRoutes.GetCredentials(address), {
        signal
      })
        .then(({ data }) => data)
        .catch((err) => {
          console.error('Error fetching verifiable credentials', err)
          return []
        })
    : []
