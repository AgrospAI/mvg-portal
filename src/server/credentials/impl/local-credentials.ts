import { Address } from 'abitype'
import { injectable } from 'inversify'
import ICredentialsService from '../credentials'

import { GaiaXVerifiablePresentationArray } from '@utils/verifiablePresentations/types'
import addresses from 'pontusxAddresses.json'
import { CredentialsServiceError } from '../errors'
import { GaiaXVerifiablePresentationSchema } from '@utils/verifiablePresentations/schemas'

@injectable()
export class LocalCredentialsService implements ICredentialsService {
  async getAddressCredentials(
    address: Address
  ): Promise<GaiaXVerifiablePresentationArray | null> {
    const entry = addresses[address]

    if (!entry) return null

    return Promise.all(
      entry.credentials.map((url: string) =>
        fetch(url, { method: 'GET' }).then(async (data) => {
          const res = await data.json()

          if (!res) throw new CredentialsServiceError('Missing response')

          const result = GaiaXVerifiablePresentationSchema.safeParse(res)
          if (result.success) return result.data

          console.error(
            '[LocalCredentialsService] Schema validation failed:',
            result.error
          )
          return []
        })
      )
    )
  }
}
