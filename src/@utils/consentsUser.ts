import { fetchData } from './fetch'

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

export async function getUserConsentsAmount(
  account: string
): Promise<ConsentsUserData> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}`
  return fetchData(url)
}
