import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useBaseModal } from '../BaseModal'
import RequestsList from '../Components/RequestsList'
import BaseModalActions from './BaseModalActions'
import styles from './BaseModalRequest.module.css'

interface BaseModalInteractiveRequestProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, requests: PossibleRequests) => void
}

function BaseModalInteractiveRequest({
  dataset,
  algorithm,
  handleSubmit
}: BaseModalInteractiveRequestProps) {
  useBaseModal()

  return (
    <Formik
      initialValues={{ reason: '', permissions: {} }}
      validate={(values) => {
        const errors: { reason?: string; permissions?: string } = {}
        if (!values.reason) {
          errors.reason = 'Required'
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
          <div className={styles.requestInfo}>
            <Field
              type="text"
              name="reason"
              placeholder="This is where your reasons go"
              class={styles.reasonTextbox}
            />
            <ErrorMessage name="reason" component="div" />
            <RequestsList
              dataset={dataset}
              algorithm={algorithm}
              isInteractive
            />
            <BaseModalActions
              acceptText="Submit"
              isLoading={!isValid || isSubmitting}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default BaseModalInteractiveRequest
