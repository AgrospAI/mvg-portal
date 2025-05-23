import { useQuery } from '@tanstack/react-query'
import { getAssetsNames } from '@utils/aquarius'
import axios from 'axios'
import Link from 'next/link'
import { useCallback } from 'react'
import styles from './index.module.css'

interface CachedAssetListTitleProps {
  did: string
}

function CachedAssetListTitle({ did }: CachedAssetListTitleProps) {
  const getAssetName = useCallback((did: string) => {
    const getAssetName = async (did: string): Promise<string> => {
      const source = axios.CancelToken.source()
      const title = await getAssetsNames([did], source.token)
      return title[did]
    }

    return getAssetName(did)
  }, [])

  const { data: assetName, isLoading } = useQuery({
    queryKey: ['asset-name', did],
    queryFn: () => getAssetName(did)
  })

  if (isLoading) return <>Loading...</>

  return (
    <h3 className={styles.title}>
      <Link href={`/asset/${did}`}>{assetName}</Link>
    </h3>
  )
}

export default CachedAssetListTitle
