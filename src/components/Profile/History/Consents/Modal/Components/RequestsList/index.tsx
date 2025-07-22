import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import Actions from '../Actions'
import styles from './index.module.css'
import { InteractiveRequests } from '../Requests/InteractiveRequests'

interface RequestsListProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: PossibleRequests) => void
}

function RequestsList({ dataset, algorithm, handleSubmit }: RequestsListProps) {
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
        handleSubmit(values.reason, values.permissions)
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className={styles.form}>
          <div className={styles.requestsListInfo}>
            <Field
              type="text"
              name="reason"
              placeholder="This is where your reasons go"
              class={styles.reasonTextbox}
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
