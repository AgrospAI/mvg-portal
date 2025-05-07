import Publisher from '@components/@shared/Publisher'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './ConsentRequest.module.css'

export interface PossibleRequests {
  trusted_algorithm_publisher: boolean
  trusted_algorithm: boolean
  trusted_credential_address: boolean
  allow_network_access: boolean
}

interface ConsentRequestProps {
  values: string
  datasetDid: string
  datasetName: string
  algorithmDid: string
  algorithmName: string
  algorithmOwnerAddress: string
  interactive?: boolean
  showAll?: boolean
}

function ConsentRequest({
  values,
  datasetDid,
  datasetName,
  algorithmDid,
  algorithmName,
  algorithmOwnerAddress,
  interactive,
  showAll
}: Readonly<ConsentRequestProps>) {
  const [val, setVal] = useState({} as PossibleRequests)

  const update = (key: keyof PossibleRequests) => {
    if (!interactive) return
    setVal((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  useEffect(() => {
    const parsedValues = values ? JSON.parse(values) : {}
    const initialValues = Object.keys(parsedValues).length
      ? parsedValues
      : {
          trusted_algorithm_publisher: false,
          trusted_algorithm: false,
          trusted_credential_address: false,
          allow_network_access: false
        }

    setVal((prev) => ({
      ...prev,
      ...initialValues
    }))
  }, [interactive, values])

  function getCompleteRequest(key: keyof PossibleRequests) {
    switch (key) {
      case 'trusted_algorithm_publisher':
        return (
          <span className={styles.requestListItem}>
            To make <Publisher account={algorithmOwnerAddress} showName /> a
            trusted service provider. This will allow all of their owned
            services to work on{' '}
            <Link href={`/asset/${datasetDid}`}>{datasetName}</Link> without
            future manual approval.
          </span>
        )
      case 'trusted_algorithm':
        return (
          <span>
            To trust the access and usage of{' '}
            <Link href={`/asset/${datasetDid}`}>{datasetName}</Link> via{' '}
            <Link href={`/asset/${algorithmDid}`}>{algorithmName}</Link>.
          </span>
        )
      case 'trusted_credential_address':
        return <span>Trusted Credential Address.</span>
      case 'allow_network_access':
        return (
          <span>
            To enable network access when using any service with data from{' '}
            <Link href={`/asset/${datasetDid}`}>{datasetName}</Link>.
          </span>
        )
    }
  }

  function getSimpleRequest(key: keyof PossibleRequests) {
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
  }

  const active = showAll
    ? Object.entries(val)
    : Object.entries(val).filter((value) => value)
  return (
    <>
      {interactive ? (
        active.map(([key, value]) => (
          <div key={key} className={styles.request}>
            <input
              className={`${styles.input_interactive} ${styles.interactive}`}
              id={`${key}_i`}
              name={key}
              type="checkbox"
              defaultChecked={value}
              onClick={() => update(key as keyof PossibleRequests)}
            />
            <label htmlFor={`${key}_i`} className={styles.interactive}>
              {getSimpleRequest(key as keyof PossibleRequests)}
            </label>
          </div>
        ))
      ) : (
        <ul className={styles.request_list}>
          {active.map(([key, _]) => (
            <li key={key}>
              {getCompleteRequest(key as keyof PossibleRequests)}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ConsentRequest
