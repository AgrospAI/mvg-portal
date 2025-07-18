import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import { PropsWithChildren } from 'react'
import AssetLink from '../AssetLink'
import styles from './index.module.css'

function DetailedAsset({ children }: PropsWithChildren) {
  return <div className={styles.content}>{children}</div>
}

function Title({ children }: PropsWithChildren) {
  return <span className={styles.title}>{children}</span>
}

function AssetInfo({ asset }: { asset: Asset }) {
  return (
    <>
      <AssetLink asset={asset} />
      <span className={styles.publisher}>
        by <Publisher account={asset.nft.owner} showName />
      </span>
    </>
  )
}

DetailedAsset.Title = Title
DetailedAsset.AssetInfo = AssetInfo

export default DetailedAsset
