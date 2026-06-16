import { SortDirectionOptions } from '@/@types/aquarius/SearchQuery'
import { MetadataRequestSortTermOptions } from '@/@types/MetadataRequest'
import Accordion from '@components/@shared/Accordion'
import Input from '@components/@shared/FormInput'
import { Sort, useMetadataRequestFilter } from '@context/MetadataRequestFilter'
import { useRouter } from 'next/router'
import queryString from 'query-string'
import { startTransition, useCallback, useEffect, useRef } from 'react'
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
  const parsedUrl = router.query
  const sortKeys = useRef(Object.keys(sort) as (keyof Sort)[])

  const getSortFromUrl = useCallback(
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

  useEffect(() => {
    const urlFilters = getSortFromUrl(parsedUrl, sortKeys.current)
    if (!urlFilters) return

    const next = { ...sort }
    let changed = false

    for (const key of sortKeys.current) {
      const urlVal = urlFilters[key]
      if (urlVal !== undefined && urlVal !== sort[key]) {
        ;(next as Record<typeof key, typeof urlVal>)[key] = urlVal
        changed = true
      }
    }

    if (changed) setSort(next)
  }, [getSortFromUrl, parsedUrl, setSort, sort])

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
    [applySort, setSort]
  )

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
