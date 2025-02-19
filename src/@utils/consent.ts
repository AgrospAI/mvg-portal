import { fetchData } from '@utils/fetch'

export async function getConsents(account: string): Promise<Consent[]> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/consents/${account}`
  return fetchData(url)
}
