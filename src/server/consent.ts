'use server'
import {
  _Consent,
  Consent,
  ConsentDirection,
  ConsentState,
  ConsentsUserData,
  PossibleRequests
} from '@utils/consents/types'
import { CONSENTS_API } from './api'

export { ConsentDirection, ConsentState, type Consent }

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
    request
  }).then((data) => data.data)
}

export async function getUserConsents(
  address: string,
  direction?: string
): Promise<Consent[]> {
  return CONSENTS_API.get(
    `/users/${address}/${direction?.toLowerCase() ?? ''}/`
  ).then((data) =>
    data.data.map((consent: _Consent) => {
      return { ...consent, direction } as Consent
    })
  )
}

export async function getUserConsentsAmount(
  address: string
): Promise<ConsentsUserData> {
  return CONSENTS_API.get(`/users/${address}/`).then((data) => data.data)
}

export async function deleteConsent(consentId: number): Promise<void> {
  return CONSENTS_API.delete(`/consents/${consentId}/`)
}
