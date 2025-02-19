import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Refresh from '@images/refresh.svg'
import { useAccount } from 'wagmi'
import styles from './index.module.css'

interface Props {
  consents?: Consent[]
  refetchConsents?: any
  isLoading?: boolean
}

const columns: TableOceanColumn<Consent>[] = [
  {
    name: 'Asset DID',
    selector: (row) => (
      <AssetListTitle did={row.asset_did} title={row.asset_did} />
    )
  },
  {
    name: 'Reason',
    selector: (row) => <span>{row.reason}</span>
  },
  {
    name: 'State',
    selector: (row) => <span>{row.state}</span>
  },
  {
    name: 'User Public Key',
    selector: (row) => <span>{row.user_public_key}</span>
  }
]

export default function ConsentsTab({
  consents,
  refetchConsents,
  isLoading
}: Props) {
  const { address } = useAccount()

  return address ? (
    <>
      {consents?.length >= 0 && (
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
      <Table
        columns={columns}
        data={consents}
        defaultSortFieldId="row.dateCreated"
        defaultSortAsc={false}
        isLoading={isLoading}
        emptyMessage={`No consents for user ${address}`}
        onChangePage={async () => await refetchConsents(true)}
      />
    </>
  ) : (
    <div>Please connect your wallet.</div>
  )
}
