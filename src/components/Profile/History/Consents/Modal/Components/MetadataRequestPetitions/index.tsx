import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { ErrorMessage, Form, Formik } from 'formik'
import { ReactNode, useState } from 'react'
import Actions from '../Actions'
import { AutoResize } from '../ConsentResponse/AutoResize'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import { TimeSelector } from '../TimeSelector/index'
import styles from './index.module.css'

const Error = ({ name }: Readonly<{ name: string }>) => (
  <ErrorMessage name={name} component="div">
    {(msg: ReactNode) => (
      <div className={styles.error}>
        <Info />
        {msg}
      </div>
    )}
  </ErrorMessage>
)

export interface SubmitType {
  reason: string
  expiresInSeconds: number
  permissions: { data?: string; requestType: number; permitted: boolean }[]
}

export const MetadataRequestPetitions = ({
  dataset,
  algorithm,
  handleSubmit
}: Readonly<{
  dataset: Asset
  algorithm: Asset
  handleSubmit: (data: SubmitType) => Promise<void>
}>) => {
  const [amount, setAmount] = useState(1)
  const [unit, setUnit] = useState(3600 * 24 * 7 * 30)

  const initialValues = {
    reason: '',
    permissions: [],
    expiresInSeconds: amount * unit
  } as SubmitType

  return (
    <Formik
      initialValues={initialValues}
      validateOnChange
      validateOnBlur={false}
      validateOnMount={false}
      validate={(values: SubmitType) => {
        const errors: Partial<Record<keyof SubmitType, string>> = {}

        if (!values.reason || values.reason.length === 0) {
          errors.reason = 'Reason required'
        } else if (values.reason.length > 255) {
          errors.reason = 'Must be 255 characters or less'
        }

        if (!values.permissions) return errors

        const permissions = Object.values(values.permissions)
        if (
          !permissions ||
          permissions.length === 0 ||
          permissions.every((x) => !x)
        ) {
          errors.permissions = 'Must make a request'
        }

        return errors
      }}
      onSubmit={async (data: SubmitType, { setSubmitting }) =>
        await handleSubmit(data).finally(() => setSubmitting(false))
      }
    >
      {({ isSubmitting, isValid, submitForm }) => (
        <Form className={styles.form}>
          <AutoResize
            name="reason"
            placeholder="This is where your reasons go"
          />
          <Error name="reason" />

          <InteractiveRequests
            dataset={dataset}
            algorithm={algorithm}
            isInteractive
          >
            Request for:
          </InteractiveRequests>

          <TimeSelector
            amount={amount}
            setAmount={setAmount}
            unit={unit}
            setUnit={setUnit}
          />
          <Error name="expiresIn" />

          <Actions
            acceptText="Submit"
            handleAccept={submitForm}
            isLoading={!isValid || isSubmitting}
          />
        </Form>
      )}
    </Formik>
  )
}

export default { MetadataRequestPetitions }
