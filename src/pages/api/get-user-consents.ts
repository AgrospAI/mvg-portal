import { getUserConsents } from '@/server/consent'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/get-user-consents HIT')

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('[API] Request parameters:', req.query)

  try {
    const { address, direction } = req.query
    const addressStr = Array.isArray(address) ? address[0] : address
    const directionStr = Array.isArray(direction) ? direction[0] : direction
    if (!addressStr) {
      return res.status(400).json({ message: 'Missing address parameter' })
    }
    const result = await getUserConsents(addressStr, directionStr)
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
