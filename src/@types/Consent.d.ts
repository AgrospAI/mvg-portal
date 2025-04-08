enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

interface Asset {
  did: string
  owner: string
}

interface Consent {
  id: number
  reason: string
  state: ConsentState
  dataset: Asset
  algorithm: Asset
  created_at: string
}

interface ConsentWithHistory {
  consent: Consent
  history: ConsentHistory[]
}

interface ConsentHistory {
  state: ConsentState
  updated_at: string
}

interface ConsentsUserData {
  address: str
  incoming_pending_consents: number
  outgoing_pending_consents: number
}
