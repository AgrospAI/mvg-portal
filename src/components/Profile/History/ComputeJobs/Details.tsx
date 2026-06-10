import { ReactElement, useEffect, useState } from 'react'
import Time from '@shared/atoms/Time'
import Button from '@shared/atoms/Button'
import Modal from '@shared/atoms/Modal'
import External from '@images/external.svg'
import { getAsset } from '@utils/aquarius'
import Results from './Results'
import styles from './Details.module.css'
import { useCancelToken } from '@hooks/useCancelToken'
import MetaItem from '../../../Asset/AssetContent/MetaItem'
import { useMarketMetadata } from '@context/MarketMetadata'

function Asset({
  title,
  symbol,
  did,
  className
}: {
  title: string
  symbol: string
  did: string
  className?: string
}) {
  return (
    <div className={`${styles.asset}${className ? ` ${className}` : ''}`}>
      <h3 className={styles.assetTitle}>
        {title}{' '}
        <a
          className={styles.assetLink}
          href={`/asset/${did}`}
          target="_blank"
          rel="noreferrer"
        >
          <External />
        </a>
      </h3>
      <p className={styles.assetMeta}>
        <span className={styles.assetMeta}> {`${symbol} | `}</span>
        <code className={styles.assetMeta}>{did}</code>
      </p>
    </div>
  )
}

function DetailsAssets({ job }: { job: ComputeJobMetaData }) {
  const { appConfig } = useMarketMetadata()
  const newCancelToken = useCancelToken()

  const [algoName, setAlgoName] = useState<string>()
  const [algoDtSymbol, setAlgoDtSymbol] = useState<string>()
  const [inputAssets, setInputAssets] = useState<
    { did: string; name: string; symbol: string }[]
  >([])

  useEffect(() => {
    async function getAlgoMetadata() {
      const ddo = await getAsset(job.algoDID, newCancelToken())
      if (!ddo) return
      setAlgoDtSymbol(ddo.datatokens[0].symbol)
      setAlgoName(ddo.metadata.name)
    }

    async function getInputAssetsMetadata() {
      const assets = await Promise.all(
        job.inputDID.map(async (did) => {
          const ddo = await getAsset(did, newCancelToken())
          return ddo
            ? { did, name: ddo.metadata.name, symbol: ddo.datatokens[0].symbol }
            : { did, name: did, symbol: '' }
        })
      )
      setInputAssets(assets)
    }

    getAlgoMetadata()
    getInputAssetsMetadata()
  }, [appConfig.metadataCacheUri, job.algoDID, job.inputDID, newCancelToken])

  return (
    <>
      {inputAssets.map((asset) => (
        <Asset
          key={asset.did}
          title={asset.name}
          symbol={asset.symbol}
          did={asset.did}
        />
      ))}
      <Asset
        title={algoName}
        symbol={algoDtSymbol}
        did={job.algoDID}
        className={styles.assetAlgo}
      />
    </>
  )
}

export default function Details({
  job
}: {
  job: ComputeJobMetaData
}): ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button style="text" size="small" onClick={() => setIsDialogOpen(true)}>
        Show Details
      </Button>
      <Modal
        title={job.statusText}
        isOpen={isDialogOpen}
        onToggleModal={() => setIsDialogOpen(false)}
      >
        <DetailsAssets job={job} />
        <Results job={job} />

        <div className={styles.meta}>
          <MetaItem
            title="Created"
            content={<Time date={job.dateCreated} isUnix relative />}
          />
          {job.dateFinished && (
            <MetaItem
              title="Finished"
              content={<Time date={job.dateFinished} isUnix relative />}
            />
          )}
          <MetaItem title="Job ID" content={<code>{job.jobId}</code>} />
        </div>
      </Modal>
    </>
  )
}
