import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { Address } from 'abitype'
import { injectable } from 'inversify'
import ICredentialsService from '../credentials'

@injectable()
export class LocalCredentialsService implements ICredentialsService {
  getAddressCredentials(
    address: Address
  ): Promise<PontusVerifiableCredentialArray> {
    throw new Error('Method not implemented.')
  }
}
