import { fetchData } from './fetch'

export async function getConsentsUser(
  account: string
): Promise<ConsentsUserData> {
  const url = `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api/users/${account}`
  return fetchData(url)
}
