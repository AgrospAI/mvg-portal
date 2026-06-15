import { TableOceanColumn } from '@components/@shared/atoms/Table'
import Time from '@components/@shared/atoms/Time'
import MetadataRequestAssetListTitle from '@components/@shared/MetadataRequestAssetListTitle'
import Publisher from '@components/@shared/Publisher'

import {
  isFinished,
  isIncoming,
  isOutgoing,
  isPending
} from '@utils/consents/utils'
import { useAccount } from 'wagmi'
import ConsentRowActions from './Actions/ConsentRowActions'
import styles from './ConsentsFeed.module.css'

import { DirectionBadge } from './Badges/DirectionBadge'
import { ConsentStateBadge } from './Badges/StateBadge'

const getColumns = (
  callerAddress: string
): TableOceanColumn<ExtendedMetadataRequest>[] => {
  const columns = [
    {
      name: 'Date',
      selector: (row) => <Time date={`${row.createdAt}`} isUnix />,
      grow: 0
    },
    {
      name: 'Expiry',
      selector: (row) =>
        row.expiresAt && <Time date={String(row.expiresAt)} isUnix relative />,
      grow: 0
    },
    {
      name: 'Dataset',
      selector: (row) => (
        <MetadataRequestAssetListTitle
          name={row?.dataset?.name}
          did={row?.dataset?.did}
          className={styles.overflow}
        />
      ),
      grow: 0
    },
    {
      name: 'Algorithm',
      selector: (row) => (
        <div className={styles.columnItem}>
          <MetadataRequestAssetListTitle
            name={row?.algorithm?.name}
            did={row?.algorithm?.did}
            className={styles.overflow}
          />
        </div>
      ),
      grow: 0
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
      grow: 0
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
      name: 'Direction',
      selector: (row) => (
        <div className={styles.columnItem}>
          <DirectionBadge request={row} userAddress={callerAddress} />
        </div>
      ),
      grow: 0,
      ignoreRowClick: true
    },
    {
      name: 'Actions',
      selector: (row) => (
        <ConsentRowActions request={row}>
          <ConsentRowActions.InspectConsent
            request={row}
            isRequested={isOutgoing(row, callerAddress)}
          />
          {isIncoming(row, callerAddress) &&
            isPending(row) &&
            isFinished(row) && <ConsentRowActions.FinalizeConsent />}
          {isOutgoing(row, callerAddress) &&
            isPending(row) &&
            !isFinished(row) && <ConsentRowActions.DeleteConsent />}
        </ConsentRowActions>
      ),
      grow: 0
    }
  ]

  return columns.map((col) => ({ ...col, width: `${100 / columns.length}%` }))
}

export const useConsentsFeed = () => {
  const { address } = useAccount()

  const columns = getColumns(address)

  return {
    address,
    columns
  }
}
