import { PossibleRequests } from '@utils/consents/types'
import { Field } from 'formik'
import { useCallback } from 'react'
import styles from './ConsentRequest.module.css'

interface ConsentRequestProps {
  values: PossibleRequests
  interactive?: boolean
  showAll?: boolean
}

function ConsentRequest({ values }: ConsentRequestProps) {
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

  return (
    <>
      Pemitted requests:
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className={styles.request}>
          <Field
            id={key}
            name={`permitted.${key}`}
            type="checkbox"
            default={!!value}
            className={`${styles.input_interactive} ${styles.interactive}`}
          />
          <label htmlFor={key} className={styles.interactive}>
            {getSimpleRequest(key as keyof PossibleRequests)}
          </label>
        </div>
      ))}
    </>
  )
}

export default ConsentRequest
