import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import CachedAssetListTitle from '@components/@shared/CachedAssetListTitle'
import Publisher from '@components/@shared/Publisher'
import {
  useUserIncomingConsents,
  useUserOutgoingConsents,
  useUserSolicitedConsents
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
  outgoingConsents: Consent[],
  solicitedConsents: Consent[]
): TabsItem[] => {
  const tabData = {
    Incoming: {
      data: incomingConsents
    },
    Outgoing: {
      data: outgoingConsents
    },
    Solicited: {
      data: solicitedConsents
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
        <CachedAssetListTitle did={extractDidFromUrl(row.dataset)} />
      )
    },
    {
      name: 'Algorithm',
      selector: (row) => (
        <div className={styles.columnItem}>
          <CachedAssetListTitle did={extractDidFromUrl(row.algorithm)} />
        </div>
      )
    },
    {
      name: 'Solicitor',
      selector: (row) => <Publisher account={row.solicitor.address} showName />
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
  const { data: solicited } = useUserSolicitedConsents()

  const searchParams = useSearchParams()
  const isOnlyPending = searchParams.get('isOnlyPending') === 'true'
  const tabIndex = Number(searchParams.get('consentTab'))

  const filterPending = (consents: Consent[]) => consents.filter(isPending)

  const queryClient = useQueryClient()
  const refreshConsents = useCallback(() => {
    ;[
      ['user-incoming-consents'],
      ['user-outgoing-consents'],
      ['user-solicited-consents']
    ].forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey, exact: false })
    )
  }, [queryClient])

  const columns = useMemo(() => getColumns(), [])
  const tabs = useMemo(
    () =>
      isOnlyPending
        ? getTabs(
            columns,
            filterPending(incoming),
            filterPending(outgoing),
            filterPending(solicited)
          )
        : getTabs(columns, incoming, outgoing, solicited),
    [columns, incoming, outgoing, solicited, isOnlyPending]
  )

  return {
    address,
    tabs,
    tabIndex,
    setTabIndex: (value: number) =>
      updateQueryParameters(router, 'consentTab', value),
    isOnlyPending,
    setIsOnlyPending: (value: boolean) =>
      updateQueryParameters(router, 'isOnlyPending', value),
    refreshConsents
  }
}
