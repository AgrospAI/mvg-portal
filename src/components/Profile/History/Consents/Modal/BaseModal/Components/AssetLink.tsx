import { useCancelToken } from '@hooks/useCancelToken'
import { Asset } from '@oceanprotocol/lib'
import { getAsset } from '@utils/aquarius'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './AssetLink.module.css'

interface AssetLinkProps {
  curr?: Asset
  did?: string
  className?: string
}

export default function AssetLink({ curr, did, className }: AssetLinkProps) {
  const newCancelToken = useCancelToken()
  const [asset, setAsset] = useState<Asset>(curr)

  useEffect(() => {
    let isMounted = true
    async function fetchAsset() {
      if (curr) {
        setAsset(curr)
      } else if (did) {
        const fetchedAsset = await getAsset(did, newCancelToken())
        console.log('fetchedAsset', fetchedAsset)
        if (isMounted && fetchedAsset) setAsset(fetchedAsset)
      } else {
        throw new Error('No did or curr provided')
      }
    }
    fetchAsset()
    return () => {
      isMounted = false
    }
  }, [curr, did, newCancelToken])

  return (
    <h3 className={className || styles.title}>
      <Link
        href={`/asset/${asset?.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {asset?.nft?.name ?? 'Missing name'}
      </Link>
    </h3>
  )
}
