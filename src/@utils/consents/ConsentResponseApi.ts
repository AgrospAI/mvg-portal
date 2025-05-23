import { CONSENTS_API } from './api'
import { Consent, ConsentResponse, PossibleRequests } from './types'

export async function getConsentResponse(
  consent: Consent,
  responseId: number
): Promise<ConsentResponse> {
  return CONSENTS_API.get(`/consents/${consent.id}/response/${responseId}/`)
}

export async function createConsentResponse(
  consent: Consent,
  reason: string,
  permitted: PossibleRequests | null
): Promise<Consent> {
  return CONSENTS_API.post(`/consents/${consent.id}/response/`, {
    reason,
    permitted: JSON.stringify(permitted) ?? '0'
  }).then((response) => response.data)
}

export async function deleteConsentResponse(consent: Consent): Promise<void> {
  return CONSENTS_API.delete(`/consents/${consent.id}/delete-response/`)
}
