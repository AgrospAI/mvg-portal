import { SortDirectionOptions } from '@/@types/aquarius/SearchQuery'
import { MetadataRequestSortTermOptions } from '@/@types/MetadataRequest'
import Accordion from '@components/@shared/Accordion'
import Input from '@components/@shared/FormInput'
import { Sort, useMetadataRequestFilter } from '@context/MetadataRequestFilter'
import { useRouter } from 'next/router'
import queryString from 'query-string'
import { startTransition, useCallback, useEffect } from 'react'
import styles from './index.module.css'

const sortItems = [
  { display: 'Created', value: MetadataRequestSortTermOptions.Created },
  { display: 'Expiration', value: MetadataRequestSortTermOptions.Expiration },
  { display: 'Status', value: MetadataRequestSortTermOptions.Status }
]

const sortDirections = [
  { display: '\u2191 Ascending', value: SortDirectionOptions.Ascending },
  { display: '\u2193 Descending', value: SortDirectionOptions.Descending }
]

export const MetadataRequestSort = ({ expanded }: { expanded?: boolean }) => {
  const { sort, setSort } = useMetadataRequestFilter()

  const router = useRouter()

  const parsedUrl = queryString.parse(location.search, {
    arrayFormat: 'separator'
  })

  const getInitialSort = useCallback(
    (
      parsedUrlParams: queryString.ParsedQuery<string>,
      filterIds: (keyof Sort)[]
    ): Sort => {
      if (!parsedUrlParams || !filterIds) return

      const initialFilters = {}
      filterIds.forEach((id) => (initialFilters[id] = parsedUrlParams?.[id]))

      return initialFilters as Sort
    },
    []
  )

  const applySort = useCallback(
    (value: string, sortId: keyof Sort) => {
      const query = { ...router.query }

      if (value.length > 0) {
        query[sortId] = value
      } else {
        delete query[sortId]
      }

      router.push(
        {
          pathname: router.pathname,
          query
        },
        undefined,
        { shallow: true }
      )
    },
    [router]
  )

  const handleSelectedSort = useCallback(
    (value: string, sortId: keyof Sort) => {
      startTransition(() => {
        const updatedSort = {
          ...sort,
          [sortId]: value
        }

        setSort(updatedSort)
        applySort(value, sortId)
      })
    },
    [applySort, setSort, sort]
  )

  useEffect(() => {
    const initialFilters = getInitialSort(
      parsedUrl,
      Object.keys(sort) as (keyof Sort)[]
    )
    setSort(initialFilters)
  }, [])

  return (
    <>
      <div className={styles.sidePositioning}>
        <Accordion title="Sort" defaultExpanded={expanded}>
          <div className={styles.sortList}>
            <div className={styles.sortType}>
              <h5 className={styles.sortTypeLabel}>Field</h5>
              {sortItems.map((item) => (
                <Input
                  key={item.value}
                  name="sortType"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sort === item.value}
                  onChange={() => handleSelectedSort(item.value, 'sort')}
                />
              ))}
            </div>
            <div className={styles.sortDirection}>
              <h5 className={styles.sortDirectionLabel}>Direction</h5>
              {sortDirections.map((item) => (
                <Input
                  key={item.value}
                  name="sortDirection"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sortOrder === item.value}
                  onChange={() => handleSelectedSort(item.value, 'sortOrder')}
                />
              ))}
            </div>
          </div>
        </Accordion>
      </div>
      <div className={styles.topPositioning}>
        <div className={styles.compactFilterContainer}>
          <Accordion title="Sort Type" compact>
            <div className={styles.compactOptionsContainer}>
              {sortItems.map((item) => (
                <Input
                  key={item.value}
                  name="sortTypeCompact"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sort === item.value}
                  onChange={() => handleSelectedSort(item.value, 'sort')}
                />
              ))}
            </div>
          </Accordion>
        </div>
        <div className={styles.compactFilterContainer}>
          <Accordion title="Sort Direction" compact>
            <div className={styles.compactOptionsContainer}>
              {sortDirections.map((item) => (
                <Input
                  key={item.value}
                  name="sortDirectionCompact"
                  type="radio"
                  options={[item.display]}
                  value={item.value}
                  checked={sort.sortOrder === item.value}
                  onChange={() => handleSelectedSort(item.value, 'sortOrder')}
                />
              ))}
            </div>
          </Accordion>
        </div>
      </div>
    </>
  )
}

export default { MetadataRequestSort }
