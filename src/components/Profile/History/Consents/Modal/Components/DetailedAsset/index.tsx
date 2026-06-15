import Publisher from '@components/@shared/Publisher'
import IconAlgorithm from '@images/algorithm.svg'
import IconDataset from '@images/dataset.svg'
import IconError from '@images/cross.svg'
import { Asset } from '@oceanprotocol/lib'
import { PropsWithChildren, ReactNode } from 'react'
import AssetLink from '../AssetLink'
import { Icon } from '../Icon'
import styles from './index.module.css'

function DetailedAsset({ children }: PropsWithChildren) {
  return <div className={styles.content}>{children}</div>
}

const AssetInfo = ({
  children,
  asset
}: {
  children?: ReactNode
  asset?: Asset
}) => (
  <div className={styles.assetInfoContainer}>
    <>
      <Icon>
        {asset ? (
          <>
            {asset?.metadata?.algorithm ? (
              <IconAlgorithm />
            ) : (
              <IconDataset styles={{ fill: 'red' }} />
            )}
          </>
        ) : (
          <IconError className={styles.error} />
        )}
      </Icon>
      <div>
        <>{children && <span className={styles.title}>{children}</span>}</>

        {asset ? (
          <>
            <AssetLink asset={asset} className={styles.assetName} />
            <span className={styles.publisher}>
              by <Publisher account={asset?.nft.owner} showName />
            </span>
          </>
        ) : (
          <span className={styles.error}>Asset Unavailable</span>
        )}
      </div>
    </>
  </div>
)

DetailedAsset.AssetInfo = AssetInfo

export default DetailedAsset
