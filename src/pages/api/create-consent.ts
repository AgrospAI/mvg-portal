import { createConsent } from '@/server/consent'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/create-consent HIT')

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('[API] Request body:', req.body)

  try {
    const { address, datasetDid, algorithmDid, request, reason } = req.body
    const result = await createConsent(
      address,
      datasetDid,
      algorithmDid,
      request,
      reason
    )
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
