import { deleteConsentResponse } from '@/server/consent-response'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[API] /api/delete-consent-response HIT')

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  console.log('[API] Request body:', req.body)

  try {
    const { consentId } = req.body
    await deleteConsentResponse(consentId)
    res.status(200)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
