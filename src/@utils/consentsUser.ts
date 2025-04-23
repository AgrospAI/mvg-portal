import { fetchData } from './fetch'

export enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

export async function getUserIncomingConsents(
  account: string
): Promise<ListConsent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}/incoming/`
  return fetchData(url).catch((error) => {
    console.error('Error fetching incoming consents:', error)
    return []
  })
}

export async function getUserOutgoingConsents(
  account: string
): Promise<ListConsent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}/outgoing/`
  return fetchData(url).catch((error) => {
    console.error('Error fetching outgoing consents:', error)
    return []
  })
}

export async function updateConsent(
  consentId: number,
  state: ConsentState
): Promise<{ state: ConsentState }> {
  // TODO: MAKE THIS WORK AGAIN

  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/consents/${consentId}/`
  return fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state: state.charAt(0) })
  }).then((response) => response.json())
}

export async function getUserConsentsAmount(
  account: string
): Promise<ConsentsUserData> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}`
  return fetchData(url)
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
