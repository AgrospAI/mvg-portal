import {
  MetadataRequestFilterByStateOptions,
  MetadataRequestFilterByTypeOptions
} from '@/@types/MetadataRequest'
import Accordion from '@components/@shared/Accordion'
import Button from '@components/@shared/atoms/Button'
import Input from '@components/@shared/FormInput'
import styles from './index.module.css'
import { useMetadataRequestFilter } from '@context/MetadataRequestFilter'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useTransition } from 'react'
import { useConsentsFeed } from '../ConsentsFeed.hooks'

interface FilterStructure {
  id: string
  label: string
  type: string
  options: {
    label: string
    value: string
  }[]
}

const filterList: FilterStructure[] = [
  {
    id: 'direction',
    label: 'Filter Direction',
    type: 'filterList',
    options: [
      { label: 'incoming', value: MetadataRequestFilterByTypeOptions.Incoming },
      { label: 'outgoing', value: MetadataRequestFilterByTypeOptions.Outgoing }
    ]
  },
  {
    id: 'state',
    label: 'Filter State',
    type: 'filterList',
    options: [
      { label: 'pending', value: MetadataRequestFilterByStateOptions.Pending },
      {
        label: 'approved',
        value: MetadataRequestFilterByStateOptions.Approved
      },
      {
        label: 'rejected',
        value: MetadataRequestFilterByStateOptions.Rejected
      },
      { label: 'resolved', value: MetadataRequestFilterByStateOptions.Resolved }
    ]
  }
]

const purgatoryFilterItem = { display: 'show purgatory ', value: 'purgatory' }
const expiredFilterItem = { display: 'show expired ', value: 'expired' }
const cx = classNames.bind(styles)

export const MetadataRequestFilters = ({
  className
}: Readonly<{ className?: string }>) => {
  const { refreshRequests } = useConsentsFeed()
  const {
    filters,
    setFilters,
    showPurgatory,
    setShowPurgatory,
    showExpired,
    setShowExpired
  } = useMetadataRequestFilter()

  const [, startTransition] = useTransition()
  const router = useRouter()

  async function applyFilter(filter: string[], filterId: string) {
    const query = { ...router.query }

    if (filter.length > 0) {
      query[filterId] = filter.join(',')
    } else {
      delete query[filterId]
    }

    router.push(
      {
        pathname: router.pathname,
        query
      },
      undefined,
      { shallow: true }
    )
  }

  async function handleSelectedFilter(value: string, filterId: string) {
    const currentFilters = filters[filterId] || []

    const updatedFilters = currentFilters.includes(value)
      ? currentFilters.filter((e) => e !== value) // Remove
      : [...new Set([...currentFilters, value])] // Add & Unique

    startTransition(() => {
      setFilters({ ...filters, [filterId]: updatedFilters })
      applyFilter(updatedFilters, filterId)
    })
  }

  async function handlePurgatoryToggle() {
    const newValue = !showPurgatory
    startTransition(() => {
      setShowPurgatory(newValue)
    })
    const query = { ...router.query }

    query.showPurgatory = String(newValue)

    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true
    })
  }

  async function handleExpiredToggle() {
    const newValue = !showExpired
    startTransition(() => {
      setShowExpired(newValue)
    })
    const query = { ...router.query }

    query.showExpired = String(newValue)

    router.push({ pathname: router.pathname, query }, undefined, {
      shallow: true
    })
  }

  const booleanCount = [showExpired, showPurgatory].reduce(
    (acc, filter) => acc + (filter ? 1 : 0),
    0
  )
  const selectedFiltersCount = filters
    ? Object.values(filters).reduce(
        (acc, filter) => acc + filter.length,
        booleanCount
      )
    : booleanCount

  const styleClasses = cx({
    filterList: true,
    [className]: className
  })

  return (
    <>
      <div className={styles.sidePositioning}>
        <Accordion
          title="Filters"
          defaultExpanded
          badgeNumber={selectedFiltersCount}
          action={
            <Button
              style="text"
              size="small"
              title="Refresh consents"
              className={styles.refresh}
              onClick={refreshRequests}
            >
              Refresh
            </Button>
          }
        >
          <div className={styleClasses}>
            {filterList.map((filter) => (
              <div key={filter.id} className={styles.filterType}>
                <h5 className={styles.filterTypeLabel}>{filter.label}</h5>
                {filter.options.map((option) => {
                  const isSelected = filters[filter.id].includes(option.value)
                  return (
                    <Input
                      key={option.value}
                      name={option.label}
                      type="checkbox"
                      options={[option.label]}
                      checked={isSelected}
                      onChange={() =>
                        handleSelectedFilter(option.value, filter.id)
                      }
                    />
                  )
                })}
              </div>
            ))}
            <div className={styles.filterType}>
              <h5 className={styles.filterTypeLabel}>Expired</h5>
              <Input
                name={expiredFilterItem.value}
                type="checkbox"
                options={[expiredFilterItem.display]}
                checked={showExpired}
                onChange={handleExpiredToggle}
              />
            </div>
            <div className={styles.filterType}>
              <h5 className={styles.filterTypeLabel}>Purgatory</h5>
              <Input
                name={purgatoryFilterItem.value}
                type="checkbox"
                options={[purgatoryFilterItem.display]}
                checked={showPurgatory}
                onChange={handlePurgatoryToggle}
              />
            </div>
          </div>
        </Accordion>
      </div>
      <div className={styles.topPositioning}>
        {filterList.map((filter) => (
          <div key={filter.id} className={styles.compactFilterContainer}>
            <Accordion
              title={filter.label}
              badgeNumber={filters[filter.id].length}
              compact
            >
              <div className={styles.compactOptionsContainer}>
                {filter.options.map((option) => {
                  const isSelected = filters[filter.id].includes(option.value)
                  return (
                    <Input
                      key={option.value}
                      name={option.label}
                      type="checkbox"
                      options={[option.label]}
                      checked={isSelected}
                      onChange={() =>
                        handleSelectedFilter(option.value, filter.id)
                      }
                    />
                  )
                })}
              </div>
            </Accordion>
          </div>
        ))}
        <div className={styles.compactFilterContainer}>
          <h5 className={styles.filterTypeLabel}>Expired</h5>
          <Input
            name={expiredFilterItem.value}
            type="checkbox"
            options={[expiredFilterItem.display]}
            checked={showExpired}
            onChange={handleExpiredToggle}
          />
        </div>
        <div className={styles.compactFilterContainer}>
          <Accordion
            title="Purgatory"
            badgeNumber={showPurgatory ? 1 : 0}
            compact
          >
            <Input
              name={purgatoryFilterItem.value}
              type="checkbox"
              options={[purgatoryFilterItem.display]}
              checked={showPurgatory}
              onChange={handlePurgatoryToggle}
            />
          </Accordion>
        </div>
      </div>
    </>
  )
}
