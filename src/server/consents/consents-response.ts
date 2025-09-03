'use server'

import { Consent, PossibleRequests } from '@utils/consents/types'

interface IConsentResponseService {
  createConsentResponse(
    consentId: string,
    reason: string,
    permitted?: PossibleRequests
  ): Promise<Consent>

  deleteConsentResponse(consentId: string): Promise<void>
}

export default IConsentResponseService
