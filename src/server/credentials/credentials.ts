'use server'
import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { Address } from 'wagmi'

interface ICredentialsService {
  getAddressCredentials(
    address: Address
  ): Promise<PontusVerifiableCredentialArray>
}

export default ICredentialsService
