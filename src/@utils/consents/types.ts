export interface Paginated<T> {
  count: number
  next: URL | null
  previous: URL | null
  results: Array<T>
}

export interface ConsentsUserData {
  address: string
  assets: string[]
  incoming_pending_consents: number
  outgoing_pending_consents: number
  solicited_pending_consents: number
}

export interface ConsentResponse {
  consent: string
  status: ConsentState
  reason: string
  permitted: string
  last_updated_at: number
}

export enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DENIED = 'Denied',
  RESOLVED = 'Resolved'
}

export enum ConsentDirection {
  INCOMING = 'Incoming',
  OUTGOING = 'Outgoing',
  SOLICITED = 'Solicited'
}

export interface _Consent {
  id: number
  url: string
  dataset: string
  algorithm: string
  solicitor: {
    url: string
    address: string
  }
  request: string
  reason: string
  created_at: number
  response: ConsentResponse | null
  status: ConsentState
}

export interface Consent extends _Consent {
  direction: ConsentDirection
}

export interface PossibleRequests {
  trusted_algorithm_publisher?: boolean
  trusted_algorithm?: boolean
  trusted_credential_address?: boolean
  allow_network_access?: boolean
}
