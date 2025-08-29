'use server'
import { RedisClientOptions, RedisClientType } from '@redis/client'
import { PontusVerifiableCredentialArraySchema } from '@utils/verifiableCredentials/schemas'
import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { injectable } from 'inversify'
import { createClient } from 'redis'
import { Address } from 'wagmi'
import ICredentialsService from '../credentials'
import { env } from 'next-runtime-env'

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

    const config: RedisClientOptions = { url }

    if (username) {
      config.username = username
      config.password = password
    }

    this.client = createClient(config as unknown)

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err)
      this.client = null
      throw new RedisCredentialsServiceError(err)
    })
    this.client.connect().catch((err) => {
      console.error('Redis connection error:', err)
      this.client = null
      throw new RedisCredentialsServiceError(err)
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
        client
          .hGetAll(address)
          .then((data) => {
            if (!Object.keys(data).length) return []

            const result = PontusVerifiableCredentialArraySchema.safeParse([
              data
            ])
            if (result.success) {
              return result.data
            }
            console.error(
              '[RedisCredentialsService] Schema validation failed:',
              result.error
            )
            return []
          })
          .catch((error) => {
            console.error(
              '[RedisCredentialsService] Failed to retrieve address credentials',
              error
            )
            return []
          })
      )
      .catch((error) => {
        console.error(
          '[RedisCredentialsService] Error retrieving redis credentials instance',
          error
        )
        return []
      })
  }
}
