import Loader from '@components/@shared/atoms/Loader'
import { subRequestsQueryOptions } from '@hooks/useMetadataRequests'
import { Asset } from '@oceanprotocol/lib'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PropsWithChildren, ReactNode, Suspense } from 'react'
import { useNetwork } from 'wagmi'
import styles from './FullRequests.module.css'
import { useCompleteRequests } from './requests.hooks'
import { VoteResults } from './VoteResults'

const SubRequests = ({
  requestId,
  dataset,
  algorithm,
  isResponse
}: Readonly<{
  requestId: number
  dataset: Asset
  algorithm: Asset
  isResponse?: boolean
}>) => {
  const { chain } = useNetwork()
  const getCompleteRequest = useCompleteRequests({ dataset, algorithm })

  const { data: subRequests } = useSuspenseQuery(
    subRequestsQueryOptions(requestId, chain.id)
  )

  if (!subRequests || subRequests.length === 0) return null

  const totalWeights = subRequests.map(
    (r) => Number(r.noWeight) + Number(r.yesWeight)
  )

  return (
    <ul className={styles.requestList}>
      {subRequests.map((subRequest, index) => (
        <li key={subRequest.id} className={styles.requestItem}>
          {getCompleteRequest(subRequest.requestType)}{' '}
          {!isResponse && subRequest.data && <>Reason: {subRequest.data}</>}
          {isResponse && (
            <VoteResults
              subRequest={subRequest}
              totalWeight={totalWeights[index]}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

export const FullRequests = ({
  requestId,
  dataset,
  algorithm,
  isResponse,
  children
}: Readonly<
  PropsWithChildren<{
    requestId: number
    dataset: Asset
    algorithm: Asset
    isResponse?: boolean
    children?: ReactNode
  }>
>) => (
  <div className={styles.requestContainer}>
    {children && <p className={styles.title}>{children}</p>}
    <Suspense fallback={<Loader />}>
      <SubRequests
        requestId={requestId}
        dataset={dataset}
        algorithm={algorithm}
        isResponse={isResponse}
      />
    </Suspense>
  </div>
)
