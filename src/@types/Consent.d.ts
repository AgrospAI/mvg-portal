enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

interface Consent {
  id: number
  reason: string
  state: ConsentState
  asset: string
  owner: string
  solicitor: string
  created_at: string
}

interface ConsentsUserData {
  address: str
  incoming_pending_consents: number
  outgoing_pending_consents: number
}
