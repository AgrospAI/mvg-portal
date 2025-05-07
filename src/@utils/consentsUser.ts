import { PossibleRequests } from '@components/Profile/History/Consents/ConsentRequest'
import { fetchData } from './fetch'

export enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DENIED = 'Denied',
  RESOLVED = 'Resolved'
}

export enum ConsentDirection {
  INCOMING,
  OUTGOING,
  SOLICITED
}

export interface ConsentsAsset {
  did: string
  owner: string
  type: 'Algorithm' | 'Dataset'
  pending_consents: number
}

export interface ExtendedAsset extends ConsentsAsset {
  name: string
}

export interface SolicitorDetailed {
  url: string
  address: string
}

export interface ListConsent {
  url: string
  reason: string
  dataset: string
  algorithm: string
  solicitor: string
  request: string
  status: ConsentState | null
  created_at: number
  type?: ConsentDirection
}

export interface Consent {
  id: number
  created_at: string
  dataset: string
  algorithm: string
  solicitor: SolicitorDetailed
  reason: string
  request: string
  response: string | null
  status: ConsentState | null
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

async function fetchConsents(
  url: string,
  direction: ConsentDirection
): Promise<ListConsent[]> {
  return fetchData(url)
    .then((data) =>
      data.map((item: ListConsent) => ({
        ...item,
        type: direction
      }))
    )
    .catch((error) => {
      console.error('Error fetching consents:', error)
      return []
    })
}

export async function getUserConsents(
  address: string,
  direction: ConsentDirection
): Promise<ListConsent[]> {
  const consentDirection = ConsentDirection[direction].toLowerCase()
  return fetchConsents(
    `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${address}/${consentDirection}/`,
    direction
  )
}

export async function updateConsent(
  baseUrl: string,
  reason: string,
  permitted: string
): Promise<ListConsent> {
  // Check this when deployed, may need to change URL to id's
  const url = `${baseUrl}response/`

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason,
      permitted
    })
  }).then((response) => response.json())
}

export async function newConsent(
  address: string,
  datasetDid: string,
  algorithmDid: string,
  reason: string,
  request: PossibleRequests
): Promise<Consent> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/consents/`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      reason,
      dataset: datasetDid,
      algorithm: algorithmDid,
      solicitor: address,
      request: JSON.stringify(request)
    })
  }).then((response) => response.json())
}

export async function getUserConsentsAmount(
  account: string
): Promise<ConsentsUserData> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}`
  return fetchData(url)
}

export async function deleteConsentResponse(
  consent: ListConsent
): Promise<void> {
  const url = `${consent.url}delete-response/`
  return fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then()
}

export function extractDidFromUrl(url: string): string | null {
  const match = url.match(/did:[^/]+/)
  return match ? match[0] : null
}

export function getAsset(url: string): Promise<ConsentsAsset | null> {
  return fetchData(url)
}

export function getConsentDetailed(url: string): Promise<Consent> {
  return fetchData(url)
}

export function getConsentResponse(url: string): Promise<ConsentResponse> {
  return fetchData(url)
}

export function parsePossibleRequest(
  formData: FormData
): PossibleRequests | null {
  const res: PossibleRequests = {} as PossibleRequests
  if (Array.from(formData.keys()).length === 0) {
    return null
  } else {
    for (const entry of formData) {
      res[entry[0]] = entry[1] ? '1' : '0'
    }
  }
  return res
}
