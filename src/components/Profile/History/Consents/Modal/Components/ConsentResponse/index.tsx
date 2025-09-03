import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useCreateConsentResponse } from '@hooks/useUserConsents'
import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { Consent, ConsentState, PossibleRequests } from '@utils/consents/types'
import { cleanRequests } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import { PropsWithChildren, ReactNode, Suspense, useState } from 'react'
import { toast } from 'react-toastify'
import ConsentStateBadge from '../../../Feed/StateBadge'
import Actions from '../Actions'
import { FullRequests, InteractiveRequests } from '../Requests'
import { AutoResize } from './AutoResize'
import styles from './index.module.css'

function ConsentResponse({ children }: PropsWithChildren) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

interface StatusProps {
  status: ConsentState
}
function Status({ status }: StatusProps) {
  return <ConsentStateBadge status={status} />
}

interface InteractiveRequestFormProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: PossibleRequests) => void
}
function InteractiveRequestForm({
  dataset,
  algorithm,
  handleSubmit
}: InteractiveRequestFormProps) {
  return (
    <Formik
      initialValues={{ reason: '', permissions: {} }}
      validate={(values) => {
        const errors: { reason?: string; permissions?: string } = {}
        if (!values.reason || values.reason.length === 0) {
          errors.reason = 'Reason required'
        } else if (values.reason.length > 255) {
          errors.reason = 'Must be 255 characters or less'
        }
        return errors
      }}
      onSubmit={(values, { setSubmitting }) => {
        console.log('Submitting', values)
        handleSubmit(values.reason, cleanRequests(values.permissions))
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
              fieldName="permissions"
            >
              <span>Requests for:</span>
            </InteractiveRequests>
            <Actions acceptText="Submit" isLoading={!isValid || isSubmitting} />
          </div>
        </Form>
      )}
    </Formik>
  )
}

interface InteractiveResponseFormProps {
  consent: Consent
  dataset: Asset
  algorithm: Asset
}
function InteractiveResponseForm({
  consent,
  dataset,
  algorithm
}: InteractiveResponseFormProps) {
  const { closeModal } = useModalContext()
  const [isTriedSubmitted, setIsTriedSubmitted] = useState(false)
  const { mutate: createConsentResponse } = useCreateConsentResponse()
  return (
    <Formik
      validateOnChange={isTriedSubmitted}
      validateOnBlur={isTriedSubmitted}
      initialValues={{ reason: '', permitted: {} as PossibleRequests }}
      validate={({ reason }) => {
        const errors: { reason?: string; permitted?: string } = {}
        if (!reason) {
          errors.reason = 'Required'
        }
        setIsTriedSubmitted(true)
        return errors
      }}
      onSubmit={({ reason, permitted }, { setSubmitting }) => {
        createConsentResponse(
          {
            consentId: consent.id,
            reason,
            permitted: cleanRequests(permitted)
          },
          {
            onSuccess: () => {
              closeModal()
              setSubmitting(false)
              toast.success('Consent responded successfully')
            }
          }
        )
      }}
    >
      {({ isValid, isSubmitting, setFieldValue, submitForm }) => (
        <Form>
          <div className={styles.requestInfo}>
            <div className={styles.requestContainer}>
              <AutoResize name="reason" placeholder="Reason of the response" />
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
                requests={consent.request}
              >
                Permissions:
              </InteractiveRequests>
              <Actions
                acceptText="Submit"
                rejectText="Reject All"
                handleReject={() =>
                  setFieldValue('permitted', {}).then(submitForm)
                }
                isLoading={isSubmitting || !isValid}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

interface ResponsePermissionsProps {
  permitted: PossibleRequests
  dataset: Asset
  algorithm: Asset
  children?: ReactNode
}
function ResponsePermissions({
  permitted,
  dataset,
  algorithm,
  children
}: ResponsePermissionsProps) {
  return (
    <div className={styles.requestInfo}>
      <div className={styles.requestContainer}>
        <FullRequests
          dataset={dataset}
          algorithm={algorithm}
          requests={permitted}
        >
          {children}
        </FullRequests>
      </div>
    </div>
  )
}

ConsentResponse.Status = Status
ConsentResponse.InteractiveResponseForm = InteractiveResponseForm
ConsentResponse.InteractiveRequestForm = InteractiveRequestForm
ConsentResponse.ResponsePermissions = ResponsePermissions

export default ConsentResponse
