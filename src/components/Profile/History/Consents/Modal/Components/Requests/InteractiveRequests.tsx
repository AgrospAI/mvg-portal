import { Asset } from '@oceanprotocol/lib'
import { MetadataRequestTypes } from '@utils/consents/utils'
import classNames from 'classnames'
import { useFormikContext } from 'formik'
import { ReactNode, useEffect } from 'react'
import { FormResponse } from '../ConsentResponse/index.hooks'
import styles from './InteractiveRequests.module.css'
import { useCompleteRequests } from './requests.hooks'

const cx = classNames.bind(styles)

const Permission = ({
  request,
  completeRequest,
  isInteractive
}: Readonly<{
  request: MetadataSubRequest
  completeRequest: string | JSX.Element
  isInteractive?: boolean
}>) => {
  const { values, setFieldValue } = useFormikContext<FormResponse>()

  const permissions = values.permissions || []

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked

    if (isChecked) {
      const newPermission = {
        permitted: true,
        requestType: request.requestType
      }
      setFieldValue('permissions', [...permissions, newPermission])
    } else {
      const updated = permissions?.filter(
        (p) => p.requestType !== request.requestType
      )
      setFieldValue('permissions', updated)
    }
  }

  const isChecked = permissions?.some(
    (p) => p.requestType === request.requestType && p.permitted
  )

  return (
    <label
      className={cx(
        styles.requestItem,
        isInteractive ? styles.interactive : styles.disabled
      )}
    >
      <input
        type="checkbox"
        className={styles.margined}
        onChange={handleCheckboxChange}
        checked={isChecked}
        disabled={!isInteractive}
      />
      {completeRequest}
    </label>
  )
}

const AllPermissions = ({
  dataset,
  algorithm
}: Readonly<{
  dataset: Asset
  algorithm: Asset
}>) => {
  const getCompleteRequest = useCompleteRequests({ dataset, algorithm })
  const defaultRequests = [] as MetadataSubRequest[]

  for (let i = 0; i < MetadataRequestTypes; i++)
    defaultRequests.push({
      id: `${i}`,
      requestType: i,
      data: '',
      yesWeight: '0',
      noWeight: '0'
    })

  return (
    <>
      {defaultRequests.map((request) => (
        <Permission
          key={request.id}
          request={request}
          completeRequest={getCompleteRequest(request.requestType)}
          isInteractive
        />
      ))}
    </>
  )
}

export const InteractiveRequests = ({
  dataset,
  algorithm,
  requests,
  isInteractive,
  children
}: Readonly<{
  dataset: Asset
  algorithm: Asset
  requests?: MetadataSubRequest[]
  isInteractive?: boolean
  children?: ReactNode
}>) => {
  const getCompleteRequest = useCompleteRequests({ dataset, algorithm })

  return (
    <div
      role="group"
      aria-labelledby="requests-group"
      className={styles.requestList}
    >
      {children}
      {requests ? (
        requests.map((request) => (
          <Permission
            key={request.id}
            request={request}
            completeRequest={getCompleteRequest(request.requestType)}
            isInteractive={isInteractive}
          />
        ))
      ) : (
        <AllPermissions dataset={dataset} algorithm={algorithm} />
      )}
    </div>
  )
}
