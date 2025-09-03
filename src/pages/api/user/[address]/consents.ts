import IConsentsService from '@/server/consents/consents'
import { container } from '@/server/di/container'
import { ConsentDirection } from '@utils/consents/types'
import { NextApiRequest, NextApiResponse } from 'next'

const consentsService = container.get<IConsentsService>('Consents')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/user/[address]/consents HIT')

  const { address } = req.query

  if (!address || Array.isArray(address)) {
    console.error('[API] Missing "address" param in URL')
    return res.status(400).json({ error: 'Missing address' })
  }

  const catchCallback = (error: any) => {
    console.error(error)
    return res.status(500).json({ error })
  }

  switch (req.method) {
    case 'GET': {
      const { direction } = req.query
      return await consentsService
        .getAddressConsents(address, direction as ConsentDirection)
        .then((result) => res.status(200).json(result))
        .catch(catchCallback)
    }
    case 'POST': {
      const { datasetDid, algorithmDid, request, reason } = req.body
      return await consentsService
        .createConsent(address, datasetDid, algorithmDid, request, reason)
        .then((result) => res.status(201).json(result))
        .catch(catchCallback)
    }
    default:
      return res.status(405).json({ message: 'Method Not Allowed' })
  }
}
