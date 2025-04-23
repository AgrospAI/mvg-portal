import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Tabs, { TabsItem } from '@components/@shared/atoms/Tabs'
import Time from '@components/@shared/atoms/Time'
import { useConsents } from '@context/Profile/ConsentsProvider'
import Refresh from '@images/refresh.svg'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import ConsentRowActions from './ConsentRowActions'
import ConsentStateBadge from './StateBadge'
import styles from './index.module.css'
import { extractDidFromUrl } from '@utils/consentsUser'

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
          columns={columns}
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

interface ConsentsTabProps {
  incomingConsents?: Consent[]
  outgoingConsents?: Consent[]
  refetchConsents?: (isRefetch: boolean) => void
  isLoading?: boolean
}

export default function ConsentsTab({
  incomingConsents,
  outgoingConsents,
  refetchConsents,
  isLoading
}: ConsentsTabProps) {
  const { address } = useAccount()
  const { isOnlyPending, setIsOnlyPending } = useConsents()

  const [actionsColumn, setActionsColumn] = useState<JSX.Element>(<></>)

  const columns: TableOceanColumn<Consent>[] = [
    {
      name: 'Dataset',
      selector: (row) => <AssetListTitle did={extractDidFromUrl(row.dataset)} />
    },
    // {
    //   name: 'State',
    //   selector: (row) => (
    //     <div className={styles.columnItem}>
    //       <ConsentStateBadge state={row.state} />
    //     </div>
    //   )
    // },
    {
      name: 'Algorithm',
      selector: (row) => (
        <div className={styles.columnItem}>
          <AssetListTitle did={extractDidFromUrl(row.algorithm)} />
        </div>
      )
    },
    {
      name: 'Date Created',
      selector: (row) => (
        <div className={styles.columnItem}>
          <Time date={row.created_at} relative isUnix />
        </div>
      )
    },
    {
      name: 'Actions',
      selector: (row) => <>{actionsColumn}</>
    }
  ]
  const tabs = getTabs(
    columns,
    isLoading,
    outgoingConsents,
    incomingConsents,
    refetchConsents
  )
  const [tabIndex, setTabIndex] = useState(() => {
    const index = tabs.findIndex((tab) => !tab.disabled)
    return index !== -1 ? index : 0
  })

  useEffect(() => {
    setActionsColumn(
      <ConsentRowActions
        consent={outgoingConsents[tabIndex]}
        type={tabIndex === 0 ? 'outgoing' : 'incoming'}
      />
    )
  }, [outgoingConsents, tabIndex])

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
