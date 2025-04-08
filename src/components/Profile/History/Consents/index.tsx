import AssetListTitle from '@components/@shared/AssetListTitle'
import Publisher from '@components/@shared/Publisher'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Tabs, { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import { useConsents } from '@context/Profile/ConsentsProvider'
import Refresh from '@images/refresh.svg'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import ConsentRowActions from './ConsentRowActions'
import ConsentStateBadge from './StateBadge'
import styles from './index.module.css'

const getTabs = (
  columns,
  isLoading,
  outgoingConsents,
  incomingConsents,
  refetchConsents
): TabsItem[] => {
  return [
    {
      title: 'Outgoing',
      content: (
        <Table
          columns={columns.filter((col) => col.name !== 'Actions')}
          data={outgoingConsents}
          sortField="row.created_at"
          sortAsc={false}
          isLoading={isLoading}
          emptyMessage="No outgoing consents"
          onChangePage={async () => await refetchConsents(true)}
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
          onChangePage={async () => await refetchConsents(true)}
        />
      ),
      disabled: !incomingConsents?.length
    }
  ]
}

export default function ConsentsTab({
  incomingConsents,
  outgoingConsents,
  refetchConsents,
  isLoading
}: {
  incomingConsents?: Consent[]
  outgoingConsents?: Consent[]
  refetchConsents?: any
  isLoading?: boolean
}) {
  const { address } = useAccount()
  const { isOnlyPending, setIsOnlyPending } = useConsents()

  const columns: TableOceanColumn<Consent>[] = [
    {
      name: 'Asset DID',
      selector: (row) => <AssetListTitle did={row.asset} />
    },
    {
      name: 'State',
      selector: (row) => (
        <div className={styles.columnItem}>
          <ConsentStateBadge state={row.state} />
        </div>
      )
    },
    {
      name: 'Owner',
      selector: (row) => (
        <div className={styles.columnItem}>
          <Publisher account={row.owner} showName={true} />
        </div>
      )
    },
    {
      name: 'Solicitor',
      selector: (row) => (
        <div className={styles.columnItem}>
          <Publisher account={row.solicitor} showName={true} />
        </div>
      )
    },
    {
      name: 'Date Created',
      selector: (row) => (
        <div className={styles.columnItem}>
          <Time date={`${row.created_at}`} relative isUnix />
        </div>
      )
    },
    {
      name: 'Actions',
      selector: (row) => (
        <div className={styles.columnItem}>
          <ConsentRowActions consent={row} />
        </div>
      )
    }
  ]
  const tabs = getTabs(
    columns,
    isLoading,
    outgoingConsents,
    incomingConsents,
    refetchConsents
  )
  // Set to first enabled tabitem
  const [tabIndex, setTabIndex] = useState(
    tabs.findIndex((tab) => !tab.disabled)
  )

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
          onClick={async () => await refetchConsents(true)}
          className={styles.refresh}
        >
          <Refresh />
          Refresh
        </Button>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            disabled={isLoading}
            checked={isOnlyPending}
            onChange={() => setIsOnlyPending(!isOnlyPending)}
          />
          Only show pending
        </label>
      </div>

      <Tabs
        items={tabs}
        selectedIndex={tabIndex}
        onIndexSelected={setTabIndex}
      />
    </div>
  )
}
