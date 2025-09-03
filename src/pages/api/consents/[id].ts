import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import { NextApiRequest, NextApiResponse } from 'next'

const consentsService = container.get<IConsentsService>('Consents')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents/[id] HIT')

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    console.error('[API] Missing "id" param in URL')
    return res.status(400).json({ error: 'Missing ID' })
  }

  switch (req.method) {
    case 'DELETE': {
      return await consentsService
        .deleteConsent(id)
        .then((result) => res.status(200).json(result))
        .catch((error) => {
          console.error(error)
          return res.status(500).json({ error })
        })
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
