import { getUserConsentsAmount } from '@/server/consent'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/get-user-consents-amount HIT')

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('[API] Request parameters:', req.query)

  try {
    const { address } = req.query
    const result = await getUserConsentsAmount(address as string)
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
