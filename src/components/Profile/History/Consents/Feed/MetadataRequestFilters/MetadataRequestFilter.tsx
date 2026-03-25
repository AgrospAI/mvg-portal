import {
  MetadataRequestFilterByTypeOptions,
  MetadataRequestSortTermOptions
} from '@/@types/MetadataRequest'
import { Filters } from '@context/Filter'
import { useRouter } from 'next/router'
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react'
import { SortDirectionOptions } from 'src/@types/aquarius/SearchQuery'

interface Sort {
  sort: MetadataRequestSortTermOptions
  sortOrder: SortDirectionOptions
}

interface FilterValue {
  filters: Filters
  setFilters: (filters: Filters) => void
  showPurgatory: boolean
  showExpired: boolean
  sort: Sort
  setShowPurgatory: Dispatch<SetStateAction<boolean>>
  setShowExpired: Dispatch<SetStateAction<boolean>>
  setSort: Dispatch<SetStateAction<Sort>>
}

const MetadataRequestFilterContext = createContext({} as FilterValue)

export const MetadataRequestFilterProvider = ({
  children
}: PropsWithChildren) => {
  const router = useRouter()

  const [filters, setFilters] = useState<Filters>({
    direction: [],
    state: []
  })
  const [showPurgatory, setShowPurgatory] = useState<boolean>()
  const [showExpired, setShowExpired] = useState<boolean>()
  const [sort, setSort] = useState<Sort>({
    sort: MetadataRequestSortTermOptions.Created,
    sortOrder: SortDirectionOptions.Descending
  })

  useEffect(() => {
    if (!router.isReady) return

    // Parse initial values from URL
    const initialFilters = {
      direction: (router.query.direction as string)
        ?.split(',')
        .filter(Boolean) || [MetadataRequestFilterByTypeOptions.Incoming],
      state: (router.query.state as string)?.split(',').filter(Boolean) || []
    }

    const initialSort: Sort = {
      sort:
        (router.query.sort as MetadataRequestSortTermOptions) ||
        MetadataRequestSortTermOptions.Expiration,
      sortOrder:
        (router.query.sortOrder as SortDirectionOptions) ||
        SortDirectionOptions.Ascending
    }

    // Use a string check for boolean query params
    const initialShowExpired = router.query.showExpired !== 'false'
    const initialShowPurgatory = router.query.showPurgatory === 'false'

    setFilters(initialFilters)
    setSort(initialSort)
    setShowPurgatory(initialShowPurgatory)
    setShowExpired(initialShowExpired)

    // Empty dependency array (mostly) - we only want to sync FROM url TO state once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  return (
    <MetadataRequestFilterContext.Provider
      value={{
        filters,
        setFilters,
        showPurgatory,
        showExpired,
        sort,
        setShowPurgatory,
        setShowExpired,
        setSort
      }}
    >
      {children}
    </MetadataRequestFilterContext.Provider>
  )
}

const useMetadataRequestFilter = (): FilterValue => {
  const ctx = useContext(MetadataRequestFilterContext)
  if (!ctx)
    throw new Error(
      'Calling useMetadataRequestFilter outside of MetadataRequestFilterProvider'
    )

  return ctx
}

export { useMetadataRequestFilter }
export default { MetadataRequestFilterProvider }
