import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Tabs, { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import CachedAssetListTitle from '@components/@shared/CachedAssetListTitle'
import Publisher from '@components/@shared/Publisher'
import Refresh from '@images/refresh.svg'
import { Consent, ConsentDirection } from '@utils/consents/types'
import { extractDidFromUrl } from '@utils/consents/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ConsentRowActions from './Actions/ConsentRowActions'
import { useConsentsFeed } from './ConsentsFeed.hooks'
import styles from './ConsentsFeed.module.css'
import ConsentStateBadge from './StateBadge'

const getTabs = (
  columns: TableOceanColumn<Consent>[],
  isLoadingIncoming: boolean,
  isLoadingOutgoing: boolean,
  isLoadingSolicited: boolean,
  incomingConsents: Consent[],
  outgoingConsents: Consent[],
  solicitedConsents: Consent[]
): TabsItem[] => {
  const tabData = {
    [ConsentDirection.INCOMING]: {
      data: incomingConsents,
      isLoading: isLoadingIncoming
    },
    [ConsentDirection.OUTGOING]: {
      data: outgoingConsents,
      isLoading: isLoadingOutgoing
    },
    [ConsentDirection.SOLICITED]: {
      data: solicitedConsents,
      isLoading: isLoadingSolicited
    }
  }

  return Object.values(ConsentDirection).map((consentDirection) => {
    const { data, isLoading } = tabData[consentDirection]
    return {
      title: consentDirection.toString(),
      disabled: !data.length,
      content: (
        <Table
          key={consentDirection}
          columns={columns}
          data={data}
          sortField="row.created_at"
          sortAsc={false}
          isLoading={isLoading}
          emptyMessage={`No ${consentDirection.toLowerCase()} consents`}
        />
      )
    }
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
      selector: (row) => <ConsentRowActions consent={row} />
    }
  ]
}

export default function ConsentsFeed() {
  const {
    address,
    incoming,
    isLoadingIncoming,
    outgoing,
    isLoadingOutgoing,
    solicited,
    isLoadingSolicited,
    setIsOnlyPending,
    isOnlyPending,
    refreshConsents
  } = useConsentsFeed()

  const columns = useMemo(() => getColumns(), [])
  const tabs = useMemo(
    () =>
      getTabs(
        columns,
        isLoadingIncoming,
        isLoadingOutgoing,
        isLoadingSolicited,
        incoming,
        outgoing,
        solicited
      ),
    [
      columns,
      isLoadingIncoming,
      isLoadingOutgoing,
      isLoadingSolicited,
      incoming,
      outgoing,
      solicited
    ]
  )

  const [tabIndex, setTabIndex] = useState(0)
  const getIndex = useCallback((tabs: TabsItem[]) => {
    const index = tabs.findIndex((tab) => !tab.disabled)
    return index === -1 ? 0 : index
  }, [])

  useEffect(() => {
    setTabIndex(getIndex(tabs))
  }, [getIndex, tabs])

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <Button
          style="text"
          size="small"
          title="Refresh consents"
          className={styles.refresh}
          onClick={refreshConsents}
        >
          <Refresh />
          Refresh
        </Button>

        <div className={styles.onlyPending}>
          <input
            type="checkbox"
            checked={isOnlyPending}
            onChange={() => setIsOnlyPending(!isOnlyPending)}
            id="onlyPending"
          />
          <label className={styles.toggle} htmlFor="onlyPending">
            Only show pending
          </label>
        </div>
      </div>

      <Tabs
        items={tabs}
        selectedIndex={tabIndex}
        onIndexSelected={setTabIndex}
      />
    </div>
  )
}
