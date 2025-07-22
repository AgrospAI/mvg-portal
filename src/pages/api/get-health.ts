import { getHealth } from '@/server/api'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/health HIT')

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await getHealth()
    .then(() => res.status(200).json({ message: 'Healthy' }))
    .catch(() => res.status(500).json({ message: 'Not healthy' }))
}
