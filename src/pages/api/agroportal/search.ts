import type { NextApiRequest, NextApiResponse } from 'next'
import type { AgroportalSearchResult } from '@components/AgroPortal/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AgroportalSearchResult | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q, ontologies, page, pagesize } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  const apiKey = process.env.AGROPORTAL_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'AGROPORTAL_API_KEY not configured' })
  }

  try {
    const searchParams = new URLSearchParams({
      q,
      ontologies: (ontologies as string) || 'AGROVOC',
      page: (page as string) || '1',
      pagesize: (pagesize as string) || '10',
      display_context: 'false',
      display_links: 'true'
    })

    const response = await fetch(
      `https://data.agroportal.lirmm.fr/search?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `apikey token=${apiKey}`,
          Accept: 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`AgroPortal API error: ${response.statusText}`)
    }

    const data: AgroportalSearchResult = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('AgroPortal search error:', error)
    return res.status(500).json({ error: 'Failed to fetch from AgroPortal' })
  }
}
