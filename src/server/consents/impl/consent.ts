'use server'
import { container } from '@/server/di/container'
import IEnvironmentService from '@/server/env/env'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import axios, { Axios } from 'axios'
import { injectable } from 'inversify'
import IConsentsService from '../consents'

const missingCallback = <T>(error: any, defaultValue: T) => {
  if (error.response.status === 404) return defaultValue
  console.error('Error fetching user consents', error)
  throw error
}

const defaultMissingCallback = <T>(defaultValue: T) => {
  return (error) => missingCallback(error, defaultValue)
}

@injectable()
export class ConsentsService implements IConsentsService {
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

  createConsent(
    address: string,
    datasetDid: string,
    algorithmDid: string,
    request: PossibleRequests,
    reason?: string
  ): Promise<Consent> {
    return this.getClient()
      .post('/consents/', {
        reason,
        dataset: datasetDid,
        algorithm: algorithmDid,
        solicitor: address,
        request: JSON.stringify(request)
      })
      .then((data) => data.data)
  }

  getAddressConsents(
    address: string,
    direction?: ConsentDirection
  ): Promise<Array<Consent>> {
    return this.getClient()
      .get(`/users/${address}/${direction?.toLowerCase() ?? ''}/`)
      .then(({ data }) => data)
      .catch(defaultMissingCallback([]))
  }

  getAddressConsentsAmount(
    address: string
  ): Promise<UserConsentsData | undefined> {
    return this.getClient()
      .get(`/users/${address}/`)
      .then((data) => data.data)
      .catch(defaultMissingCallback(undefined))
  }

  deleteConsent(consentId: string): Promise<void> {
    return this.getClient().delete(`/consents/${consentId}/`)
  }
}
