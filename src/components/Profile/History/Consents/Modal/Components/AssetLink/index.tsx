import { useCancelToken } from '@hooks/useCancelToken'
import { Asset } from '@oceanprotocol/lib'
import { getAsset } from '@utils/aquarius'
import { extractDidFromUrl } from '@utils/consents/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './index.module.css'

interface AssetLinkProps {
  asset?: Asset
  did?: string
  className?: string
}

export default function AssetLink({ asset, did, className }: AssetLinkProps) {
  const newCancelToken = useCancelToken()
  const [curr, setCurr] = useState<Asset>(asset)

  useEffect(() => {
    let isMounted = true

    if (did) {
      getAsset(extractDidFromUrl(did), newCancelToken()).then((fetched) => {
        isMounted && setCurr(fetched)
      })
    }

    return () => {
      isMounted = false
    }
  }, [did, newCancelToken])

  return (
    <h3 className={className || styles.title}>
      <Link
        href={`/asset/${asset?.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {curr?.nft?.name ?? 'Missing name'}
      </Link>
    </h3>
  )
}
