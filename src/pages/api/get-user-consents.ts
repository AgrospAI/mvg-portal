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
    const result = await getUserConsents(address, direction)
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
