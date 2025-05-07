import Link from 'next/link'
import styles from './AssetLink.module.css'

interface AssetLinkProps {
  did: string
  name: string
  className?: string
}

export default function AssetLink({ did, name, className }: AssetLinkProps) {
  return (
    <h3 className={className || styles.title}>
      <Link href={`/asset/${did}`} target="_blank" rel="noopener noreferrer">
        {name}
      </Link>
    </h3>
  )
}
