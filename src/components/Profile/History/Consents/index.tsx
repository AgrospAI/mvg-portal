import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Refresh from '@images/refresh.svg'
import { useAccount } from 'wagmi'
import styles from './index.module.css'
import Publisher from '@components/@shared/Publisher'
import Time from '@components/@shared/atoms/Time'
import Tabs, { TabsItem } from '@components/@shared/atoms/Tabs'
import { useState } from 'react'

const columns: TableOceanColumn<Consent>[] = [
  {
    name: 'Asset DID',
    selector: (row) => <AssetListTitle did={row.asset} />
  },
  {
    name: 'Reason',
    selector: (row) => <span>{'Show more'}</span>
  },
  {
    name: 'State',
    selector: (row) => <span>{row.state}</span>
  },
  {
    name: 'Owner',
    selector: (row) => <Publisher account={row.owner} showName={true} />
  },
  {
    name: 'Solicitor',
    selector: (row) => <Publisher account={row.solicitor} showName={true} />
  },
  {
    name: 'Date Created',
    selector: (row) => <Time date={row.created_at} relative />
  },
  {
    name: 'Actions',
    selector: (row) => (
      <Button size="small" title="Actions">
        ...
      </Button>
    )
  }
]

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

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  if (incomingConsents?.length === 0 && outgoingConsents?.length === 0) {
    return <div>No consents</div>
  }

  const getTabs = (): TabsItem[] => {
    return [
      {
        title: 'Outgoing',
        content: (
          <Table
            columns={columns}
            data={outgoingConsents}
            defaultSortFieldId="row.created_at"
            defaultSortAsc={false}
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
            defaultSortFieldId="row.created_at"
            defaultSortAsc={false}
            isLoading={isLoading}
            emptyMessage="No incoming consents"
            onChangePage={async () => await refetchConsents(true)}
          />
        ),
        disabled: !incomingConsents?.length
      }
    ]
  }

  const tabs = getTabs()
  // Set to first enabled tabitem
  const [tabIndex, setTabIndex] = useState(
    tabs.findIndex((tab) => !tab.disabled)
  )

  return (
    <>
      {(incomingConsents?.length || outgoingConsents?.length) && (
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
      )}

      <Tabs
        items={tabs}
        className={styles.tabs}
        selectedIndex={tabIndex}
        onIndexSelected={setTabIndex}
      />
    </>
  )
}
