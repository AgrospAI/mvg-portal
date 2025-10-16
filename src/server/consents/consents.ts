'use server'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'

interface IConsentsService {
  createConsent(
    address: string,
    datasetDid: string,
    algorithmDid: string,
    request: PossibleRequests,
    reason?: string
  ): Promise<Consent>
  getAddressConsents(
    address: string,
    direction?: ConsentDirection
  ): Promise<Array<Consent>>
  getAddressConsentsAmount(
    address: string
  ): Promise<UserConsentsData | undefined>
  deleteConsent(consentId: string): Promise<void>
}

export default IConsentsService
