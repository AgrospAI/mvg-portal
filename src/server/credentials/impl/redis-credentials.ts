'use server'
import { RedisClientType } from '@redis/client'
import { PontusVerifiableCredentialArraySchema } from '@utils/verifiableCredentials/schemas'
import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { injectable } from 'inversify'
import { createClient } from 'redis'
import { Address } from 'wagmi'
import ICredentialsService from '../credentials'
import { env } from 'next-runtime-env'

export const dynamic = 'force-dynamic'

class RedisCredentialsServiceError extends Error {}

@injectable()
export class RedisCredentialsService implements ICredentialsService {
  private client: RedisClientType | null

  private async getClient(): Promise<RedisClientType> {
    if (this.client) return this.client

    const url = env('CREDENTIALS_REDIS_URL')
    const username = env('CREDENTIALS_REDIS_USERNAME')
    const password = env('CREDENTIALS_REDIS_PASSWORD')

    if (!url) throw new RedisCredentialsServiceError('Missing URL')
    if ((username && !password) || (password && !username)) {
      throw new RedisCredentialsServiceError(
        'Config "username" and "password" must be both undefined or set'
      )
    }

    console.log(
      '[RedisCredentialsService]: Connecting to url %s as %s with pwd %s',
      url,
      username,
      password
    )

    if (username) {
      this.client = createClient({
        url,
        username,
        password
      })
    } else {
      this.client = createClient({
        url
      })
    }

    this.client.on('error', (err) => console.error('Redis Client Error', err))
    this.client.connect().catch((err) => {
      console.error('Redis connection error:', err)
      throw new Error(err)
    })

    return this.client
  }

  async getAddressCredentials(
    address: Address
  ): Promise<PontusVerifiableCredentialArray> {
    if (!address) {
      console.error(
        '[RedisCredentialsService] getAddressCredentials caled with undefined address'
      )
      return []
    }

    return this.getClient()
      .then((client) =>
        client.hGetAll(address).then((data) => {
          const result = PontusVerifiableCredentialArraySchema.safeParse([data])
          if (result.success) {
            return result.data
          }
          console.error(
            '[RedisCredentialsService] Schema validation failed:',
            result.error
          )
          return []
        })
      )
      .catch((err) => {
        console.error(
          '[RedisCredentialsService] Error while fetching credentials',
          err
        )
        throw new RedisCredentialsServiceError(err)
      })
  }
}
