import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Tabs, { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import Publisher from '@components/@shared/Publisher'
import { useConsents } from '@context/Profile/ConsentsProvider'
import Refresh from '@images/refresh.svg'
import { extractDidFromUrl, ListConsent } from '@utils/consentsUser'
import { useCallback, useState } from 'react'
import { useAccount } from 'wagmi'
import ConsentRowActions from './ConsentRowActions'
import styles from './index.module.css'
import ConsentStateBadge from './StateBadge'

const getTabs = (
  columns: TableOceanColumn<ListConsent>[],
  isLoading: boolean,
  outgoingConsents: ListConsent[],
  incomingConsents: ListConsent[],
  solicitedConsents: ListConsent[],
  onChangePage: (tabIndex: number) => void
): TabsItem[] => {
  return [
    {
      title: 'Outgoing',
      content: (
        <Table
          columns={columns}
          data={outgoingConsents}
          sortField="row.created_at"
          sortAsc={false}
          isLoading={isLoading}
          emptyMessage="No outgoing consents"
          onChangePage={onChangePage}
        />
      ),
      disabled: !outgoingConsents?.length
    },
    {
      title: 'Incoming',
      content: (
        <Table
          columns={columns}
          data={incomingConsents}
          sortField="row.created_at"
          sortAsc={false}
          isLoading={isLoading}
          emptyMessage="No incoming consents"
          onChangePage={onChangePage}
        />
      ),
      disabled: !incomingConsents?.length
    },
    {
      title: 'Solicited',
      content: (
        <Table
          columns={columns}
          data={solicitedConsents}
          sortField="row.created_at"
          sortAsc={false}
          isLoading={isLoading}
          emptyMessage="No solicited consents"
          onChangePage={onChangePage}
        />
      ),
      disabled: !solicitedConsents?.length
    }
  ]
}

interface ConsentsTabProps {
  incomingConsents?: ListConsent[]
  outgoingConsents?: ListConsent[]
  solicitedConsents?: ListConsent[]
  refetchConsents?: (isRefetch: boolean) => void
  isLoading?: boolean
}

export default function ConsentsTab({
  incomingConsents,
  outgoingConsents,
  solicitedConsents,
  refetchConsents,
  isLoading
}: ConsentsTabProps) {
  const { address } = useAccount()
  const {
    isOnlyPending,
    setIsOnlyPending,
    refetchIncoming,
    refetchOutgoing,
    refetchSolicited
  } = useConsents()

  const columns: TableOceanColumn<ListConsent>[] = [
    {
      name: 'Date',
      selector: (row) => <Time date={`${row.created_at}`} isUnix />
    },
    {
      name: 'Dataset',
      selector: (row) => <AssetListTitle did={extractDidFromUrl(row.dataset)} />
    },
    {
      name: 'Algorithm',
      selector: (row) => (
        <div className={styles.columnItem}>
          <AssetListTitle did={extractDidFromUrl(row.algorithm)} />
        </div>
      )
    },
    {
      name: 'Solicitor',
      selector: (row) => <Publisher account={row.solicitor} showName />
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

  const onChangePage = useCallback(
    (newTabIndex: number) => {
      const refetch = (tabIndex: number) => {
        switch (tabIndex) {
          case 0:
            refetchOutgoing()
            break
          case 1:
            refetchIncoming()
            break
          case 2:
            refetchSolicited()
            break
        }
      }
      refetch(newTabIndex)
    },
    [refetchIncoming, refetchOutgoing, refetchSolicited]
  )

  const tabs = getTabs(
    columns,
    isLoading,
    outgoingConsents,
    incomingConsents,
    solicitedConsents,
    onChangePage
  )
  const [tabIndex, setTabIndex] = useState(() => {
    const index = tabs.findIndex((tab) => !tab.disabled)
    return index !== -1 ? index : 0
  })

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
          disabled={isLoading}
          onClick={async () => refetchConsents(true)}
          className={styles.refresh}
        >
          <Refresh />
          Refresh
        </Button>

        <div className={styles.onlyPending}>
          <input
            type="checkbox"
            disabled={isLoading}
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
