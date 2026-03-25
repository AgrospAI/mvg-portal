import Table from '@components/@shared/atoms/Table'
import { useConsentsFeed } from './ConsentsFeed.hooks'
import styles from './ConsentsFeed.module.css'
import { consentsTableStyles } from './ConsentsFeedStyles'
import { MetadataRequestFilters } from './MetadataRequestFilters'

export default function ConsentsFeed() {
  const { address, requests, columns } = useConsentsFeed()

  if (!address) {
    return <div>Please connect your wallet.</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <MetadataRequestFilters />
      </div>
      <div className={styles.results}>
        <Table
          columns={columns}
          data={requests}
          emptyMessage="No requests"
          customStyles={consentsTableStyles}
          highlightOnHover
        />
      </div>
    </div>
  )
}
