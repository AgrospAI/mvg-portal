import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { cleanRequests } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import Actions from '../Actions'
import { AutoResize } from '../ConsentResponse/AutoResize'
import Reason from '../Reason'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import styles from './index.module.css'

interface RequestsListProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: PossibleRequests) => void
}

function RequestsList({ dataset, algorithm, handleSubmit }: RequestsListProps) {
  return (
    <Formik
      initialValues={{ reason: '', permissions: {} }}
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
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
        console.log('Submitting', reason, permissions)

        handleSubmit(reason, cleanRequests(permissions))
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className={styles.form}>
          <div className={styles.requestsListInfo}>
            <Reason text={'Reason'}>
              <AutoResize
                name="reason"
                placeholder="This is where your reasons go"
              />
            </Reason>
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
              Request for:
            </InteractiveRequests>
            <Actions acceptText="Submit" isLoading={!isValid || isSubmitting} />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default RequestsList
