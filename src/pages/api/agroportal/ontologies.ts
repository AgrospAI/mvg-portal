import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.AGROPORTAL_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'AGROPORTAL_API_KEY not configured' })
  }

  try {
    const response = await fetch(
      `https://data.agroportal.lirmm.fr/ontologies`,
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

    const data = await response.json()
    const acronyms = data.map((ontology) => ontology.acronym)
    return res.status(200).json(acronyms)
  } catch (error) {
    console.error('AgroPortal search error:', error)
    return res.status(500).json({ error: 'Failed to fetch from AgroPortal' })
  }
}
