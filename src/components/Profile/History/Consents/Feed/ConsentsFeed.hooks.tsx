import { TableOceanColumn } from '@components/@shared/atoms/Table'
import Time from '@components/@shared/atoms/Time'
import MetadataRequestAssetListTitle from '@components/@shared/MetadataRequestAssetListTitle'
import Publisher from '@components/@shared/Publisher'

import { useMetadataRequests } from '@context/UserMetadataRequests'
import {
  isFinished,
  isIncoming,
  isOutgoing,
  isPending
} from '@utils/consents/utils'
import { useAccount } from 'wagmi'
import ConsentRowActions from './Actions/ConsentRowActions'
import styles from './ConsentsFeed.module.css'
import ConsentStateBadge from './StateBadge'

const getColumns = (
  callerAddress: string
): TableOceanColumn<ExtendedMetadataRequest>[] => [
  {
    name: 'Date',
    selector: (row) => <Time date={`${row.createdAt}`} isUnix />
  },
  {
    name: 'Expiry',
    selector: (row) =>
      row.expiresAt && <Time date={String(row.expiresAt)} isUnix relative />
  },
  {
    name: 'Dataset',
    selector: (row) =>
      row.dataset &&
      row.dataset.did &&
      row.dataset.name && (
        <MetadataRequestAssetListTitle
          name={row.dataset.name}
          did={row.dataset.did}
          className={styles.overflow}
        />
      )
  },
  {
    name: 'Algorithm',
    selector: (row) =>
      row.algorithm &&
      row.algorithm.did &&
      row.algorithm.name && (
        <div className={styles.columnItem}>
          <MetadataRequestAssetListTitle
            name={row.algorithm.name}
            did={row.algorithm.did}
            className={styles.overflow}
          />
        </div>
      )
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
    )
  },
  {
    name: 'State',
    selector: (row) => (
      <div className={styles.columnItem}>
        <ConsentStateBadge status={row.status} />
      </div>
    ),

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
        {isOutgoing(row, callerAddress) &&
          isPending(row) &&
          (isFinished(row) ? (
            <ConsentRowActions.FinalizeConsent />
          ) : (
            <ConsentRowActions.DeleteConsent />
          ))}
      </ConsentRowActions>
    )
  }
]

export const useConsentsFeed = () => {
  const { address } = useAccount()
  const { requests, refreshRequests } = useMetadataRequests()

  const columns = getColumns(address)

  return {
    address,
    columns,
    requests,
    refreshRequests
  }
}
