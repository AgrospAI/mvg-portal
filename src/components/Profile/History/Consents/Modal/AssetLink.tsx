import styles from './AssetLink.module.css'
import Link from 'next/link'

interface AssetLinkProps {
  did: string
  name: string
}

export default function AssetLink({ did, name }: AssetLinkProps) {
  return (
    <h3 className={styles.title}>
      <Link href={`/asset/${did}`} target="_blank" rel="noopener noreferrer">
        {name}
      </Link>
    </h3>
  )
}
