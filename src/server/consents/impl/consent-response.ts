'use server'
import { validateWithSchema } from '@utils/consents/api'
import { ConsentSchema } from '@utils/consents/schemas'
import { Consent, PossibleRequests } from '@utils/consents/types'
import axios, { Axios } from 'axios'
import { injectable } from 'inversify'
import { env } from 'next-runtime-env'
import IConsentResponseService from '../consents-response'

@injectable()
export class ConsentResponseService implements IConsentResponseService {
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

  createConsentResponse(
    consentId: string,
    reason: string,
    permitted?: PossibleRequests
  ): Promise<Consent> {
    console.log(permitted)
    const isPermitted =
      permitted && Object.values(permitted).some((value) => Boolean(value))

    return this.getClient()
      .post(`/consents/${consentId}/response/`, {
        reason,
        permitted: isPermitted ? JSON.stringify(permitted) : '0'
      })
      .then(validateWithSchema(ConsentSchema))
  }

  async deleteConsentResponse(consentId: string): Promise<void> {
    return this.getClient().delete(`/consents/${consentId}/delete-response/`)
  }
}
