import { fetchData } from './fetch'

export enum ConsentState {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected'
}

export async function getUserIncomingConsents(
  account: string
): Promise<Consent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}/incoming/`
  return fetchData(url)
}

export async function getUserOutgoingConsents(
  account: string
): Promise<Consent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}/outgoing/`
  return fetchData(url)
}

export async function getUserConsents(account: string): Promise<Consent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/consents/?owner=${account}&solicitor=${account}`
  return fetchData(url)
}

export async function updateConsent(
  consentId: number,
  state: ConsentState
): Promise<{ state: ConsentState }> {
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
