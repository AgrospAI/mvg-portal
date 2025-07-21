import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import CachedAssetListTitle from '@components/@shared/CachedAssetListTitle'
import Publisher from '@components/@shared/Publisher'
import {
  useUserIncomingConsents,
  useUserOutgoingConsents
} from '@hooks/useUserConsents'
import { useQueryClient } from '@tanstack/react-query'

import { Consent, ConsentDirections } from '@utils/consents/types'
import {
  extractDidFromUrl,
  isIncoming,
  isOutgoing,
  isPending
} from '@utils/consents/utils'
import { updateQueryParameters } from '@utils/searchParams'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import ConsentRowActions from './Actions/ConsentRowActions'
import styles from './ConsentsFeed.module.css'
import ConsentStateBadge from './StateBadge'

const getTabs = (
  columns: TableOceanColumn<Consent>[],
  incomingConsents: Consent[],
  outgoingConsents: Consent[]
): TabsItem[] => {
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
          sortField="row.created_at"
          sortAsc={false}
          isLoading={false}
          emptyMessage={`No ${consentDirection.toLowerCase()} consents`}
        />
      ),
      disabled: !data.length
    } as TabsItem
  })
}

const getColumns = (): TableOceanColumn<Consent>[] => {
  return [
    {
      name: 'Date',
      selector: (row) => <Time date={`${row.created_at}`} isUnix />
    },
    {
      name: 'Dataset',
      selector: (row) => (
        <CachedAssetListTitle
          did={extractDidFromUrl(row.dataset)}
          className={styles.centered}
        />
      )
    },
    {
      name: 'Algorithm',
      selector: (row) => (
        <div className={styles.columnItem}>
          <CachedAssetListTitle
            did={extractDidFromUrl(row.algorithm)}
            className={styles.centered}
          />
        </div>
      )
    },
    {
      name: 'Solicitor',
      selector: (row) => (
        <Publisher
          account={row.solicitor.address}
          showName
          className={styles.centered}
        />
      )
    },
    {
      name: 'State',
      selector: (row) => (
        <div className={styles.columnItem}>
          <ConsentStateBadge status={row.status} />
        </div>
      )
    },
    {
      name: 'Actions',
      selector: (row) => (
        <ConsentRowActions consent={row}>
          <ConsentRowActions.Inspect consent={row} />
          {isOutgoing(row) ? <ConsentRowActions.DeleteConsent /> : <></>}
          {isIncoming(row) && row.response ? (
            <ConsentRowActions.DeleteConsentResponse />
          ) : (
            <></>
          )}
        </ConsentRowActions>
      )
    }
  ]
}

export const useConsentsFeed = () => {
  const router = useRouter()
  const { address } = useAccount()

  const { data: incoming } = useUserIncomingConsents()
  const { data: outgoing } = useUserOutgoingConsents()

  const searchParams = useSearchParams()
  const isOnlyPending = searchParams.get('isOnlyPending') === 'true'

  const getDefaultIndex = useCallback(() => {
    let tabIndex = 0

    if (incoming.length) tabIndex = 0
    else if (outgoing.length) tabIndex = 1

    const params = new URLSearchParams(window.location.search)
    params.set('consentTab', tabIndex.toString())
    router.push(`${window.location.pathname}?${params.toString()}`, undefined, {
      shallow: true
    })

    return tabIndex
  }, [incoming, outgoing, router])
  const tabIndex = Number(searchParams.get('consentTab') ?? getDefaultIndex())

  const filterPending = (consents: Consent[]) => consents.filter(isPending)

  const queryClient = useQueryClient()
  const refreshConsents = useCallback(() => {
    ;[['user-incoming-consents'], ['user-outgoing-consents']].forEach(
      (queryKey) => queryClient.invalidateQueries({ queryKey, exact: false })
    )
  }, [queryClient])

  const columns = useMemo(() => getColumns(), [])
  const tabs = useMemo(
    () =>
      isOnlyPending
        ? getTabs(columns, filterPending(incoming), filterPending(outgoing))
        : getTabs(columns, incoming, outgoing),
    [columns, incoming, outgoing, isOnlyPending]
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
