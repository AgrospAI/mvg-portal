import Alert from '@components/@shared/atoms/Alert'
import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useAsset } from '@context/Asset'
import { subRequestsQueryOptions } from '@hooks/useMetadataRequests'
import { useVoteMetadataRequest } from '@hooks/useUserConsents'
import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { useSuspenseQuery } from '@tanstack/react-query'
import { isFinished } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import { PropsWithChildren, ReactNode, Suspense, useState } from 'react'
import { toast } from 'react-toastify'
import { useNetwork } from 'wagmi'
import ConsentStateBadge from '../../../Feed/StateBadge'
import Actions from '../Actions'
import { FullRequests } from '../Requests/FullRequests'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import { SwitchNetwork } from '../SwitchNetwork'
import { AutoResize } from './AutoResize'
import { AutoSave } from './AutoSave'
import { FormResponse, useMetadataRequestResponse } from './index.hooks'
import styles from './index.module.css'

function ConsentResponse({ children }: PropsWithChildren) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

interface StatusProps {
  status: MetadataRequest['status']
}

function Status({ status }: StatusProps) {
  return <ConsentStateBadge status={status} />
}

interface InteractiveRequestFormProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: MetadataRequest) => void // TODO: Change to a MetadataRequestCreate type?
}

function InteractiveRequestForm({
  dataset,
  algorithm,
  handleSubmit
}: InteractiveRequestFormProps) {
  return (
    <Formik
      initialValues={{ reason: '', permissions: [] } as FormResponse}
      validate={(values) => {
        const errors: { reason?: string; permissions?: string } = {}

        if (!values.reason || values.reason.length === 0) {
          errors.reason = 'Reason required'
        } else if (values.reason.length > 255) {
          errors.reason = 'Must be 255 characters or less'
        }

        return errors
      }}
      onSubmit={({ reason, permissions }, { setSubmitting }) => {
        handleSubmit(reason, permissions)
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className={styles.form}>
          <div className={styles.requestInfo}>
            <AutoResize
              name="reason"
              placeholder="This is where your reasons go"
            />
            <ErrorMessage name="reason" component="div">
              {(msg) => (
                <div className={styles.error}>
                  <Info />
                  {msg}
                </div>
              )}
            </ErrorMessage>
            <InteractiveRequests
              dataset={dataset}
              algorithm={algorithm}
              isInteractive
            ></InteractiveRequests>
            <Actions acceptText="Submit" isLoading={!isValid || isSubmitting} />
          </div>
        </Form>
      )}
    </Formik>
  )
}

interface InteractiveResponseFormProps {
  chainId: number
  request: MetadataRequest
  dataset: Asset
  algorithm: Asset
}

function InteractiveResponseForm({
  chainId,
  request,
  dataset,
  algorithm
}: InteractiveResponseFormProps) {
  const { asset } = useAsset()
  const { chain } = useNetwork()
  const { closeModal } = useModalContext()
  const [isTriedSubmitted, setIsTriedSubmitted] = useState(false)
  const { voteMetadataRequest } = useVoteMetadataRequest()

  const { cachedResponse, setCachedResponse, userVote } =
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
        }).then(() => {
          closeModal()
          setSubmitting(false)
          toast.success('MetadataRequest responded successfully')
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

interface ResponsePermissionsProps {
  requestId: number
  dataset: Asset
  algorithm: Asset
  children?: ReactNode
}

const ResponsePermissions = ({
  requestId,
  dataset,
  algorithm,
  children
}: ResponsePermissionsProps) => (
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
ConsentResponse.InteractiveRequestForm = InteractiveRequestForm
ConsentResponse.ResponsePermissions = ResponsePermissions

export default ConsentResponse
