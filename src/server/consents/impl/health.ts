import axios, { Axios } from 'axios'
import { env } from 'next-runtime-env'
import IConsentsHealthService from '../health'
import { injectable } from 'inversify'

@injectable()
export class ConsentsHealthService implements IConsentsHealthService {
  private client: Axios | undefined

  private getClient(): Axios {
    if (this.client) return this.client

    const apiUrl = env('CONSENTS_API_URL')
    if (!apiUrl)
      throw new Error('Missing environment variable CONSENTS_API_URL')

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return this.client
  }

  async getHealth(): Promise<void> {
    await this.getClient().get('health')
  }
}
