import Publisher from '@components/@shared/Publisher'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { Field } from 'formik'
import Link from 'next/link'
import { useCallback } from 'react'
import styles from './index.module.css'

interface RequestsProps {
  permissions?: PossibleRequests
  dataset: Asset
  algorithm: Asset
  isInteractive?: boolean
  showFull?: boolean
}

function Requests({
  permissions,
  dataset,
  algorithm,
  isInteractive,
  showFull
}: RequestsProps) {
  const getSimpleRequest = useCallback((key: keyof PossibleRequests) => {
    switch (key) {
      case 'trusted_algorithm_publisher':
        return 'Do you want to trust the publisher?'
      case 'trusted_algorithm':
        return 'Do you want to trust the algorithm usage?'
      case 'trusted_credential_address':
        return 'Trusted Credential Address'
      case 'allow_network_access':
        return 'Do you want to allow network access?'
    }
  }, [])

  const getCompleteRequest = useCallback(
    (key: keyof PossibleRequests) => {
      switch (key) {
        case 'trusted_algorithm_publisher':
          return (
            <>
              To make{' '}
              <Publisher
                account={algorithm.nft.owner}
                showName
                className={styles.publisher}
              />{' '}
              a trusted service provider. This will allow all of their owned
              services to work on{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>{' '}
              without future manual approval.
            </>
          )
        case 'trusted_algorithm':
          return (
            <>
              To trust the access and usage of{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link> via{' '}
              <Link href={`/asset/${algorithm.id}`}>{algorithm.nft.name}</Link>.
            </>
          )
        case 'trusted_credential_address':
          return <>Trusted Credential Address.</>
        case 'allow_network_access':
          return (
            <>
              To enable network access when using any service with data from{' '}
              <Link href={`/asset/${dataset.id}`}>{dataset.nft.name}</Link>.
            </>
          )
      }
    },
    [dataset, algorithm]
  )

  const requests = Object.entries(
    permissions || {
      trusted_algorithm_publisher: false,
      trusted_algorithm: false,
      trusted_credential_address: false,
      allow_network_access: false
    }
  )

  if (isInteractive) {
    return (
      <div
        role="group"
        aria-labelledby="requests-group"
        className={styles.requestList}
      >
        {requests.map(([permission]) => (
          <label
            key={permission}
            className={`${styles.interactive} ${styles.requestItem}`}
          >
            <Field
              type="checkbox"
              name={`permitted.${permission}`}
              value="on"
              className={styles.margined}
            />
            {getCompleteRequest(permission as keyof PossibleRequests)}
          </label>
        ))}
      </div>
    )
  }

  if (showFull) {
    return (
      <div className={styles.requestContainer}>
        <ul className={styles.requestList}>
          {requests.map(([key]) => (
            <li key={key} className={styles.requestItem}>
              {getCompleteRequest(key as keyof PossibleRequests) ??
                `Unexpected key ${key}`}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <>
      {requests
        .filter((req) => req)
        .map(([key]) => (
          <div key={key} className={styles.request}>
            <li className={styles.requestItem}>
              {getSimpleRequest(key as keyof PossibleRequests) ??
                `Unexpected key ${key}`}
            </li>
          </div>
        ))}
    </>
  )
}

export default Requests
