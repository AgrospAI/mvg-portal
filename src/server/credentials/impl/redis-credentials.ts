'use server'
import { container } from '@/server/di/container'
import IEnvironmentService from '@/server/env/env'
import { RedisClientOptions, RedisClientType } from '@redis/client'
import {
  GaiaXVerifiablePresentationSchema,
  PontusVerifiableCredentialArraySchema
} from '@utils/verifiablePresentations/schemas'
import { GaiaXVerifiablePresentationArray } from '@utils/verifiablePresentations/types'
import { injectable } from 'inversify'
import { createClient } from 'redis'
import { Address } from 'wagmi'
import ICredentialsService from '../credentials'
import { CredentialsServiceError } from '../errors'

@injectable()
export class RedisCredentialsService implements ICredentialsService {
  private client: RedisClientType | null

  private async getClient(): Promise<RedisClientType> {
    if (this.client) return this.client

    const environment = container.get<IEnvironmentService>('Env')
    const env = environment.getMultiple([
      'CREDENTIALS_REDIS_URL',
      'CREDENTIALS_REDIS_USERNAME',
      'CREDENTIALS_REDIS_PASSWORD'
    ])

    if (!env.CREDENTIALS_REDIS_URL) {
      throw new CredentialsServiceError('Missing URL')
    }
    if (!!env.CREDENTIALS_REDIS_USERNAME !== !!env.CREDENTIALS_REDIS_PASSWORD) {
      throw new CredentialsServiceError(
        'Config "CREDENTIALS_REDIS_USERNAME" and "CREDENTIALS_REDIS_PASSWORD" must be both undefined or set'
      )
    }

    console.log(
      '[RedisCredentialsService]: Connecting to url %s as %s',
      env.CREDENTIALS_REDIS_URL,
      env.CREDENTIALS_REDIS_USERNAME
    )

    const config: RedisClientOptions = {
      url: env.CREDENTIALS_REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          console.warn(`[Redis] Attempt ${retries}, retrying in 5s...`)
          return 5000
        }
      },
      disableOfflineQueue: true,
      commandsQueueMaxLength: 0
    }

    if (env.CREDENTIALS_REDIS_USERNAME) {
      config.username = env.CREDENTIALS_REDIS_USERNAME
      config.password = env.CREDENTIALS_REDIS_PASSWORD
    }

    this.client = createClient(config as unknown)

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err)
      this.client = null
    })
    await this.client.connect().catch((err) => {
      console.error('Redis connection Error:', err)
      this.client = null
    })

    return this.client
  }

  async getAddressCredentials(
    address: Address
  ): Promise<GaiaXVerifiablePresentationArray> {
    if (!address) {
      console.error(
        '[RedisCredentialsService] getAddressCredentials called with undefined address'
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
            if (!result.success) {
              console.error(
                '[RedisCredentialsService] Schema validation failed:',
                result.error
              )
              return []
            }

            return Promise.all(
              result.data.map((vp) =>
                fetch(vp.credentialUrl).then(async (data) => {
                  const res = await data.json()

                  const parsed =
                    GaiaXVerifiablePresentationSchema.safeParse(res)

                  if (parsed.success) return parsed.data

                  console.error(
                    '[RedisCredentialsService] Schema validation failed:',
                    result.error
                  )
                  return []
                })
              )
            )
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
