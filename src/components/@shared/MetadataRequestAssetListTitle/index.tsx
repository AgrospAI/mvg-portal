import Link from 'next/link'
import styles from './index.module.css'

interface MetadataRequestAssetListTitleProps {
  name: string
  did: string
  className?: string
}

const MetadataRequestAssetListTitle = ({
  name,
  did,
  className
}: MetadataRequestAssetListTitleProps) => (
  <h3 className={`${styles.title} ${className}`}>
    {name ? (
      <Link href={`/asset/${did}`}>{name}</Link>
    ) : (
      <span className={styles.deleted}>&lt;DELETED&gt;</span>
    )}
  </h3>
)

export default MetadataRequestAssetListTitle
