'use server'
import axios, { Axios } from 'axios'
import { injectable } from 'inversify'
import IConsentsHealthService from '../health'
import { container } from '@/server/di/container'
import IEnvironmentService from '@/server/env/env'

@injectable()
export class ConsentsHealthService implements IConsentsHealthService {
  private client: Axios | undefined

  private getClient(): Axios {
    if (this.client) return this.client

    const environment = container.get<IEnvironmentService>('Env')
    this.client = axios.create({
      baseURL: environment.get('CONSENTS_API_URL'),
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
