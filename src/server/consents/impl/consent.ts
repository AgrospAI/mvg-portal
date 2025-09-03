'use server'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import axios, { Axios } from 'axios'
import { env } from 'next-runtime-env'
import IConsentsService from '../consents'
import { injectable } from 'inversify'

@injectable()
export class ConsentsService implements IConsentsService {
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
  }

  getAddressConsentsAmount(address: string): Promise<UserConsentsData> {
    return this.getClient()
      .get(`/users/${address}/`)
      .then((data) => data.data)
  }

  deleteConsent(consentId: string): Promise<void> {
    return this.getClient().delete(`/consents/${consentId}/`)
  }
}
