import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import Link from 'next/link'
import { useCallback } from 'react'

import styles from './Common.module.css'

export const useSimpleRequests = () =>
  useCallback((requestType: MetadataSubRequest['requestType']) => {
    switch (requestType) {
      case 0:
        return 'Do you want to allow network access?'
      case 1:
        return 'Do you want to trust the algorithm usage?'
      case 2:
        return 'Do you want to trust the publisher?'
      default:
        return `Unexpected key ${requestType}`
    }
  }, [])

export const useCompleteRequests = ({
  dataset,
  algorithm
}: {
  dataset?: Asset
  algorithm?: Asset
}) =>
  useCallback(
    (requestType: MetadataSubRequest['requestType']) => {
      // Fallback names if the assets or their nested NFT metadata are missing
      const datasetName = dataset?.nft?.name ?? 'Unknown Dataset'
      const algorithmName = algorithm?.nft?.name ?? 'Unknown Algorithm'

      switch (requestType) {
        case 0:
          return (
            <>
              To enable network access when using any service with data from{' '}
              {dataset?.id ? (
                <Link href={`/asset/${dataset.id}`}>{datasetName}</Link>
              ) : (
                <span className={styles.error}>{datasetName}</span>
              )}
              .
            </>
          )
        case 1:
          return (
            <>
              To trust the access and usage of{' '}
              {dataset?.id ? (
                <Link href={`/asset/${dataset.id}`}>{datasetName}</Link>
              ) : (
                <span className={styles.error}>{datasetName}</span>
              )}{' '}
              via{' '}
              {algorithm?.id ? (
                <Link href={`/asset/${algorithm.id}`}>{algorithmName}</Link>
              ) : (
                <span className={styles.error}>{algorithmName}</span>
              )}
              .
            </>
          )
        case 2:
          return (
            <>
              To make{' '}
              {algorithm?.nft?.owner ? (
                <Publisher account={algorithm.nft.owner} showName />
              ) : (
                <span className={styles.error}>Unknown Publisher</span>
              )}{' '}
              a trusted service provider. This will allow all of their owned
              services to work on{' '}
              {dataset?.id ? (
                <Link href={`/asset/${dataset.id}`}>{datasetName}</Link>
              ) : (
                <span className={styles.error}>{datasetName}</span>
              )}{' '}
              without future manual approval.
            </>
          )
        default:
          return (
            <span className={styles.error}>
              `Unexpected key ${requestType}`
            </span>
          )
      }
    },
    [dataset, algorithm]
  )
