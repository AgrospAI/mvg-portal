import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import MetadataRequestAssetListTitle from '@components/@shared/MetadataRequestAssetListTitle'
import Publisher from '@components/@shared/Publisher'

import { useMetadataRequests } from '@context/UserMetadataRequests'
import { ConsentDirections } from '@utils/consents/types'
import { isFinished, isPending } from '@utils/consents/utils'
import { updateQueryParameters } from '@utils/searchParams'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import ConsentRowActions from './Actions/ConsentRowActions'
import styles from './ConsentsFeed.module.css'
import { consentsTableStyles } from './ConsentsFeedStyles'
import ConsentStateBadge from './StateBadge'

const INCOMING_TAB_INDEX = 0
const REQUESTED_TAB_INDEX = 1

const getTabs = (
  columns: TableOceanColumn<ExtendedMetadataRequest>[],
  incomingConsents: ExtendedMetadataRequest[],
  outgoingConsents: ExtendedMetadataRequest[]
): TabsItem[] => {
  // For some reason, the sortField is not working with the `created_at` field, so we sort it manually by
  // the `created_at` field in descending order and their state
  const sortByPriority = (consents: ExtendedMetadataRequest[]) =>
    consents.sort((a, b) => {
      const statusDiff = a.status - b.status
      if (statusDiff !== 0) return statusDiff

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  ;[incomingConsents, outgoingConsents].forEach(sortByPriority)

  const tabData = {
    Incoming: {
      data: incomingConsents
    },
    Outgoing: {
      data: outgoingConsents
    }
  }

  return ConsentDirections.map((consentDirection) => {
    const { data } = tabData[consentDirection]
    return {
      title: consentDirection.toString(),
      content: (
        <Table
          key={consentDirection}
          columns={columns}
          data={data}
          emptyMessage={`No ${consentDirection.toLowerCase()} consents`}
          customStyles={consentsTableStyles}
          highlightOnHover
        />
      ),
      disabled: !data.length
    } as TabsItem
  })
}

const getColumns = (
  isRequested: boolean,
  callerAddress: string
): TableOceanColumn<ExtendedMetadataRequest>[] => {
  return [
    {
      name: 'Date',
      selector: (row) => <Time date={`${row.createdAt}`} isUnix />,
      grow: 0
    },
    {
      name: 'Expiry',
      selector: (row) =>
        row.expiresAt && <Time date={String(row.expiresAt)} isUnix relative />
    },
    {
      name: 'Dataset',
      selector: (row) =>
        row.dataset &&
        row.dataset.did &&
        row.dataset.name && (
          <MetadataRequestAssetListTitle
            name={row.dataset.name}
            did={row.dataset.did}
            className={styles.overflow}
          />
        ),
      grow: 1
    },
    {
      name: 'Algorithm',
      selector: (row) =>
        row.algorithm &&
        row.algorithm.did &&
        row.algorithm.name && (
          <div className={styles.columnItem}>
            <MetadataRequestAssetListTitle
              name={row.algorithm.name}
              did={row.algorithm.did}
              className={styles.overflow}
            />
          </div>
        ),
      grow: 1
    },
    {
      name: 'Solicitor',
      selector: (row) => (
        <div className={styles.centered}>
          <Publisher
            account={row.requester}
            showName
            className={styles.overflow}
          />
        </div>
      ),
      grow: 0,
      omit: isRequested
    },
    {
      name: 'State',
      selector: (row) => (
        <div className={styles.columnItem}>
          <ConsentStateBadge status={row.status} />
        </div>
      ),
      grow: 0,
      ignoreRowClick: true
    },
    {
      name: 'Voted',
      selector: (row) => {
        return (
          <input
            type="checkbox"
            checked={
              !row.votes.findIndex(
                (v) => v.voter.toLowerCase() === callerAddress.toLowerCase()
              )
            }
          />
        )
      },
      omit: isRequested
    },
    {
      name: 'Actions',
      selector: (row) => (
        <ConsentRowActions request={row}>
          <ConsentRowActions.InspectConsent
            request={row}
            isRequested={isRequested}
          />
          {isRequested && isPending(row) && !isFinished(row) && (
            <ConsentRowActions.DeleteConsent />
          )}
          {isRequested && isPending(row) && isFinished(row) && (
            <ConsentRowActions.FinalizeConsent />
          )}
        </ConsentRowActions>
      )
    }
  ]
}

export const useConsentsFeed = () => {
  const router = useRouter()
  const { address } = useAccount()
  const { refreshIncoming, refreshRequested } = useMetadataRequests()

  const { incoming, requested } = useMetadataRequests()

  const searchParams = useSearchParams()
  const isOnlyPending = searchParams.get('isOnlyPending') === 'true'

  const getDefaultIndex = useCallback(
    (defaultValue: number) => {
      let tabIndex = defaultValue
      let updated = false

      // If the given (stored) value has consents, keep it
      if ([incoming, requested][tabIndex]?.length) return tabIndex

      if (incoming.length) {
        tabIndex = INCOMING_TAB_INDEX
        updated = true
      } else if (requested.length) {
        tabIndex = REQUESTED_TAB_INDEX
        updated = true
      }
      updated &&
        updateQueryParameters(router, 'consentTab', tabIndex.toString())

      return tabIndex
    },
    [incoming, requested, router]
  )

  const tabIndex = getDefaultIndex(Number(searchParams.get('consentTab')))

  const filterPending = (consents: ExtendedMetadataRequest[]) =>
    consents.filter(isPending)

  const refreshConsents = useCallback(() => {
    refreshIncoming()
    refreshRequested()
  }, [refreshIncoming, refreshRequested])

  const columns = getColumns(tabIndex === REQUESTED_TAB_INDEX, address)

  const tabs = useMemo(
    () =>
      isOnlyPending
        ? getTabs(columns, filterPending(incoming), filterPending(requested))
        : getTabs(columns, incoming, requested),
    [columns, incoming, requested, isOnlyPending]
  )

  return {
    address,
    tabs,
    tabIndex,
    setTabIndex: (value: number) =>
      updateQueryParameters(router, 'consentTab', value),
    isOnlyPending,
    setIsOnlyPending: (value: boolean) =>
      updateQueryParameters(router, 'isOnlyPending', value || null),
    refreshConsents
  }
}
