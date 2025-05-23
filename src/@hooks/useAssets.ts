import { useUserPreferences } from '@context/UserPreferences'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import { useState } from 'react'
import {
  SortDirectionOptions,
  SortTermOptions
} from 'src/@types/aquarius/SearchQuery'
import { useCancelToken } from './useCancelToken'
import { useQuery } from '@tanstack/react-query'

export const useAssets = (address: string, type: 'algorithm' | 'dataset') => {
  const { chainIds } = useUserPreferences()
  const newCancelToken = useCancelToken()

  const filters = [] as FilterTerm[]

  filters.push(getFilterTerm('metadata.type', type))
  filters.push(getFilterTerm('nft.state', [0, 4, 5]))
  filters.push(getFilterTerm('nft.owner', address.toLowerCase()))

  const baseQueryParams = {
    chainIds,
    filters,
    sortOptions: {
      sortBy: SortTermOptions.Created,
      sortDirection: SortDirectionOptions.Descending
    },
    ignorePurgatory: true,
    esPaginationOptions: {
      from: 0,
      size: 9
    }
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryParams)

  return useQuery({
    queryKey: [type, address],
    queryFn: async () => await queryMetadata(query, newCancelToken())
  })
}
