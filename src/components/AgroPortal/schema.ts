// https://data.agroportal.lirmm.fr/documentation

export interface AgroportalSearchResult {
  page: number
  pageCount: number
  totalCount: number
  prevPage: number | null
  nextPage: number | null
  links: Links
  collection: Collection[]
}

export interface Links {
  nextPage: string | null
  prevPage: string | null
}

export interface Collection {
  prefLabel: string
  synonym?: string[]
  obsolete: boolean
  matchType: string
  ontologyType: string
  '@id': string
  '@type': string
  links: Links2
  definition?: string[]
}

export interface Links2 {
  self: string
  ontology: string
  children: string
  parents: string
  descendants: string
  ancestors: string
  instances: string
  tree: string
  notes: string
  mappings: string
  ui: string
}
