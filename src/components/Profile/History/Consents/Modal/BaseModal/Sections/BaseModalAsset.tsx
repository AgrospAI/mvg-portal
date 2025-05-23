import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import { useBaseModal } from '../BaseModal'
import AssetLink from '../Components/AssetLink'
import styles from './BaseModalAsset.module.css'

interface BaseModalAssetProps {
  title: string
  asset: Asset
}

function BaseModalAsset({ title, asset }: BaseModalAssetProps) {
  useBaseModal()

  return (
    <div className={styles.content}>
      <p className={styles.title}>{title}</p>
      {asset && (
        <>
          <AssetLink asset={asset} />
          <span className={styles.publisher}>
            by <Publisher account={asset.nft.owner} showName />
          </span>
        </>
      )}
    </div>
  )
}

export default BaseModalAsset
