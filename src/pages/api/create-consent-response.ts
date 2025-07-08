import { createConsentResponse } from '@/server/consent-response'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/create-consent-response HIT')

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('[API] Request body:', req.body)

  try {
    const { consentId, reason, permitted } = req.body
    const result = await createConsentResponse(consentId, reason, permitted)
    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
