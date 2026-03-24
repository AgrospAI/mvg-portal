import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import Link from 'next/link'
import { useCallback } from 'react'

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
  dataset: Asset
  algorithm: Asset
}) =>
  useCallback(
    (requestType: MetadataSubRequest['requestType']) => {
      switch (requestType) {
        case 0:
          return (
            <>
              To enable network access when using any service with data from{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>.
            </>
          )
        case 1:
          return (
            <>
              To trust the access and usage of{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link> via{' '}
              <Link href={`/asset/${algorithm.id}`}>{algorithm.nft.name}</Link>.
            </>
          )
        case 2:
          return (
            <>
              To make <Publisher account={algorithm.nft.owner} showName /> a
              trusted service provider. This will allow all of their owned
              services to work on{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>{' '}
              without future manual approval.
            </>
          )
        default:
          return `Unexpected key ${requestType}`
      }
    },
    [dataset, algorithm]
  )
