'use server'
import { validateWithSchema } from '@utils/consents/api'
import { ConsentSchema } from '@utils/consents/schemas'
import { Consent, PossibleRequests } from '@utils/consents/types'
import { CONSENTS_API } from './api'

export async function createConsentResponse(
  consentId: string,
  reason: string,
  permitted?: PossibleRequests
): Promise<Consent> {
  console.log(permitted)
  const isPermitted =
    permitted && Object.values(permitted).some((value) => Boolean(value))

  return CONSENTS_API.post(`/consents/${consentId}/response/`, {
    reason,
    permitted: isPermitted ? JSON.stringify(permitted) : '0'
  }).then(validateWithSchema(ConsentSchema))
}

export async function deleteConsentResponse(consentId: string): Promise<void> {
  return CONSENTS_API.delete(`/consents/${consentId}/delete-response/`)
}
