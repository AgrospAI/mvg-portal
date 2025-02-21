import AssetListTitle from '@components/@shared/AssetListTitle'
import Button from '@components/@shared/atoms/Button'
import Table, { TableOceanColumn } from '@components/@shared/atoms/Table'
import Refresh from '@images/refresh.svg'
import { useAccount } from 'wagmi'
import styles from './index.module.css'
import Publisher from '@components/@shared/Publisher'

const columns: TableOceanColumn<Consent>[] = [
  {
    name: 'Asset DID',
    selector: (row) => <AssetListTitle did={row.asset_did} />
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
    name: 'User Public Key',
    selector: (row) => (
      <Publisher account={row.user_public_key} showName={true} />
    )
  }
]

export default function ConsentsTab({
  consents,
  refetchConsents,
  isLoading
}: {
  consents?: Consent[]
  refetchConsents?: any
  isLoading?: boolean
}) {
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
