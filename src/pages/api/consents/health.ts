import IConsentsHealthService from '@/server/consents/health'
import { container } from '@/server/di/container'
import type { NextApiRequest, NextApiResponse } from 'next'

const healthService = container.get<IConsentsHealthService>('ConsentsHealth')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents/health HIT')

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  await healthService
    .getHealth()
    .then(() => res.status(200).json({ message: 'Healthy' }))
    .catch(() => res.status(500).json({ message: 'Not healthy' }))
}
