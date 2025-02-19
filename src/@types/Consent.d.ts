enum ConsentState {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2
}

interface Consent {
  id: number
  asset_did: string
  reason: string
  state: ConsentState
  user_public_key: string
}

interface ConsentsUserData {
  address: str
  pending_consents: number
  total_consents: number
}
