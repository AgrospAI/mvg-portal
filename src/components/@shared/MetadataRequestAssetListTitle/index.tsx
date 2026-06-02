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
}: MetadataRequestAssetListTitleProps) => {
  console.log('Called with', {
    name,
    did
  })

  return (
    <h3 className={`${styles.title} ${className}`}>
      {name && did ? (
        <Link href={`/asset/${did}`}>{name}</Link>
      ) : (
        <span className={styles.deleted}>Asset Not Found</span>
      )}
    </h3>
  )
}

export default MetadataRequestAssetListTitle
