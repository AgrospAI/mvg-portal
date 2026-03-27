import Alert from '@components/@shared/atoms/Alert'
import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useAsset } from '@context/Asset'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { subRequestsQueryOptions } from '@hooks/useMetadataRequests'
import { useVoteMetadataRequest } from '@hooks/useUserMetadataRequests'
import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { useSuspenseQuery } from '@tanstack/react-query'
import { isFinished } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import { PropsWithChildren, ReactNode, Suspense, useState } from 'react'
import { toast } from 'react-toastify'
import { useNetwork } from 'wagmi'
import { ConsentStateBadge } from '../../../Feed/Badges/StateBadge'
import Actions from '../Actions'
import { FullRequests } from '../Requests/FullRequests'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import { SwitchNetwork } from '../SwitchNetwork'
import { AutoResize } from './AutoResize'
import { AutoSave } from './AutoSave'
import { FormResponse, useMetadataRequestResponse } from './index.hooks'
import styles from './index.module.css'

const ConsentResponse = ({ children }: Readonly<PropsWithChildren>) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
)

const Status = ({
  status
}: Readonly<{ status: MetadataRequest['status'] }>) => (
  <ConsentStateBadge status={status} />
)

function InteractiveResponseForm({
  chainId,
  request,
  dataset,
  algorithm
}: Readonly<{
  chainId: number
  request: MetadataRequest
  dataset: Asset
  algorithm: Asset
}>) {
  const { asset } = useAsset()
  const { chain } = useNetwork()
  const { closeModal } = useModalContext()
  const [isTriedSubmitted, setIsTriedSubmitted] = useState(false)
  const { voteMetadataRequest } = useVoteMetadataRequest()
  const { refreshRequests } = useMetadataRequests()

  const { cachedResponse, setCachedResponse, userVote, refreshVotes } =
    useMetadataRequestResponse(request.id)

  const { data: subRequests } = useSuspenseQuery(
    subRequestsQueryOptions(request.id, chain.id)
  )

  const hasAlreadyVoted = userVote !== undefined
  const isExpired = isFinished(request)
  const isInteractive = !hasAlreadyVoted && !isExpired
  const isWrongChain = asset?.chainId !== chainId

  return (
    <Formik
      key={chainId}
      enableReinitialize
      validateOnChange={isTriedSubmitted}
      validateOnBlur={isTriedSubmitted}
      initialValues={cachedResponse}
      validate={({ reason }) => {
        const errors: Partial<Record<keyof FormResponse, string>> = {}
        if (!reason) {
          errors.reason = 'Required'
        }
        setIsTriedSubmitted(true)

        return errors
      }}
      onSubmit={(response: FormResponse, { setSubmitting }) =>
        isInteractive &&
        voteMetadataRequest({
          requestId: request.id,
          response
        })
          .then(() => {
            closeModal()
            setSubmitting(false)
            refreshVotes()
            refreshRequests()
            toast.success('MetadataRequest responded successfully')
          })
          .catch((err) => {
            toast.error(
              'There was an error voting, maybe you have already voted?',
              err
            )
          })
      }
    >
      {({ isValid, isSubmitting, setFieldValue, submitForm }) => (
        <Form>
          <AutoSave onChange={setCachedResponse} />
          <div className={styles.requestInfo}>
            <div className={styles.requestContainer}>
              <AutoResize
                name="reason"
                placeholder="Reason of the response"
                disabled={!isInteractive}
              />
              <ErrorMessage name="reason" component="div">
                {(msg) => (
                  <div className={styles.error}>
                    <Info className={styles.errorIcon} />
                    {msg}
                  </div>
                )}
              </ErrorMessage>
              <InteractiveRequests
                dataset={dataset}
                algorithm={algorithm}
                requests={subRequests}
                isInteractive={isInteractive}
              >
                Permissions:
              </InteractiveRequests>
              {hasAlreadyVoted && (
                <Alert
                  text="You have already voted this request"
                  state="info"
                />
              )}
              {isExpired && (
                <Alert
                  text="You can't vote in an expired request"
                  state="info"
                />
              )}
              {}
              <div className={styles.actions}>
                <SwitchNetwork
                  chainId={chainId}
                  targetNetwork={asset?.chainId}
                />
                <Actions
                  acceptText="Submit"
                  rejectText="Reject All"
                  handleAccept={submitForm}
                  handleReject={() =>
                    setFieldValue('permissions', []).then(submitForm)
                  }
                  isLoading={
                    isSubmitting || !isValid || isWrongChain || !isInteractive
                  }
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

const ResponsePermissions = ({
  requestId,
  dataset,
  algorithm,
  children
}: Readonly<{
  requestId: number
  dataset: Asset
  algorithm: Asset
  children?: ReactNode
}>) => (
  <div className={styles.requestInfo}>
    <div className={styles.requestContainer}>
      <FullRequests
        dataset={dataset}
        algorithm={algorithm}
        requestId={requestId}
        isResponse
      >
        {children}
      </FullRequests>
    </div>
  </div>
)

ConsentResponse.Status = Status
ConsentResponse.InteractiveResponseForm = InteractiveResponseForm
ConsentResponse.ResponsePermissions = ResponsePermissions

export default ConsentResponse
