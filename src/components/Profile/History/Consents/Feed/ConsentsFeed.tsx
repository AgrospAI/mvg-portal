import Table from '@components/@shared/atoms/Table'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { useConsentsFeed } from './ConsentsFeed.hooks'
import styles from './ConsentsFeed.module.css'
import { consentsTableStyles } from './ConsentsFeedStyles'
import { MetadataRequestFilters } from './MetadataRequestFilters'
import { MetadataRequestSort } from './MetadataRequestSort'

export default function ConsentsFeed() {
  const { address, columns } = useConsentsFeed()
  const { requests } = useMetadataRequests()

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <MetadataRequestFilters />
        <MetadataRequestSort />
      </div>
      <div className={styles.results}>
        <Table
          columns={columns}
          // data={requests.filter((r) => r.algorithm?.did && r.dataset?.did)}
          data={requests}
          emptyMessage="No requests found"
          customStyles={consentsTableStyles}
          highlightOnHover
        />
      </div>
    </div>
  )
}
