'use server'
import { CONSENTS_API } from './api'
import {
  ConsentDirection,
  ConsentState,
  Consent,
  PossibleRequests,
  _Consent,
  ConsentsUserData
} from './types'

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
    request: JSON.stringify(request)
  }).then((data) => data.data)
}

export async function getUserConsents(
  address: string,
  direction?: ConsentDirection
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
  return CONSENTS_API.get(`/users/${address}`).then((data) => data.data)
}
