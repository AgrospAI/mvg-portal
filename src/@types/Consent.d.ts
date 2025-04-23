enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

interface ConsentsAsset {
  did: string
  owner: string
  type: 'Algorithm' | 'Dataset'
  pending_consents: number
}

interface SolicitorDetailed {
  url: string
  address: string
}

interface ListConsent {
  url: string
  reason: string
  dataset: string
  algorithm: string
  solicitor: string
  created_at: number
}

interface Consent {
  id: number
  created_at: string
  dataset: string
  algorithm: string
  solicitor: SolicitorDetailed
  reason: string
  request: string
  response: string | null
}

interface ConsentsUserData {
  address: string
  assets: string[]
  incoming_pending_consents: number
  outgoing_pending_consents: number
}
