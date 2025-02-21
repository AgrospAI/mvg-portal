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
  public_key: str
  incoming_consents: number
  outgoing_consents: number
}
