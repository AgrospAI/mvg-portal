'use server'
import {
  Consent,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import { CONSENTS_API } from './api'

export async function createConsent(
  address: string,
  datasetDid: string,
  algorithmDid: string,
  request: PossibleRequests,
  reason?: string
): Promise<Consent> {
  return CONSENTS_API.post('/consents/', {
    reason,
    dataset: datasetDid,
    algorithm: algorithmDid,
    solicitor: address,
    request: JSON.stringify(request)
  }).then((data) => data.data)
}

export async function getUserConsents(
  address: string,
  direction?: string
): Promise<Consent[]> {
  return CONSENTS_API.get(
    `/users/${address}/${direction?.toLowerCase() ?? ''}/`
  ).then(({ data }) => data)
}

export async function getUserConsentsAmount(
  address: string
): Promise<UserConsentsData> {
  return CONSENTS_API.get(`/users/${address}/`).then((data) => data.data)
}

export async function deleteConsent(consentId: number): Promise<void> {
  return CONSENTS_API.delete(`/consents/${consentId}/`)
}
