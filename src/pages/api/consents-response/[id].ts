import IConsentResponseService from '@/server/consents/consents-response'
import { container } from '@/server/di/container'
import type { NextApiRequest, NextApiResponse } from 'next'

const consentResponseService =
  container.get<IConsentResponseService>('ConsentResponse')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/consents-response/[id] HIT')

  const { id } = req.query

  if (!id || Array.isArray(id)) {
    console.error('[API] Missing "id" param in URL')
    return res.status(400).json({ error: 'Missing ID' })
  }

  const catchCallback = (error: any) => {
    console.error(error)
    return res.status(500).json({ error })
  }

  switch (req.method) {
    case 'POST': {
      const { reason, permitted } = req.body
      return consentResponseService
        .createConsentResponse(id, reason, permitted)
        .then((results) => res.status(201).json(results))
        .catch(catchCallback)
    }
    case 'DELETE': {
      return consentResponseService
        .deleteConsentResponse(id)
        .then(() => res.status(200).json({}))
        .catch(catchCallback)
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
