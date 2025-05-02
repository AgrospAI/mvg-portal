import Publisher from '@components/@shared/Publisher'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './ConsentRequest.module.css'

import { ExtendedAsset } from '@utils/consentsUser'

export interface PossibleRequests {
  trusted_algorithm_publisher: boolean
  trusted_algorithm: boolean
  trusted_credential_address: boolean
  allow_network_access: boolean
}

interface ConsentRequestProps {
  values: string
  dataset: ExtendedAsset
  algorithm: ExtendedAsset
  interactive?: boolean
}

function ConsentRequest({
  values,
  dataset,
  algorithm,
  interactive
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
    // If the consents are interactive, set them to false by default
    for (const key in JSON.parse(values) as PossibleRequests) {
      setVal((prev) => ({
        ...prev,
        [key]: !interactive
      }))
    }
  }, [interactive, values])

  function getCompleteRequest(key: keyof PossibleRequests) {
    switch (key) {
      case 'trusted_algorithm_publisher':
        return (
          <span className={styles.requestListItem}>
            To make <Publisher account={algorithm.owner} showName /> a trusted
            service provider. This will allow all of their owned services to
            work on <Link href={`/asset/${dataset.did}`}>{dataset.name}</Link>{' '}
            without future manual approval.
          </span>
        )
      case 'trusted_algorithm':
        return (
          <span>
            To trust the access and usage of{' '}
            <Link href={`/asset/${dataset.did}`}>{dataset.name}</Link> via{' '}
            <Link href={`/asset/${algorithm.did}`}>{algorithm.name}</Link>.
          </span>
        )
      case 'trusted_credential_address':
        return <span>Trusted Credential Address.</span>
      case 'allow_network_access':
        return (
          <span>
            To enable network access when using any service with data from{' '}
            <Link href={`/asset/${dataset.did}`}>{dataset.name}</Link>.
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

  const active = Object.entries(val).filter((value) => value)
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
