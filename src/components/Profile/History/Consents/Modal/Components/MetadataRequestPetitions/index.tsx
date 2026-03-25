import { useIsMounted } from '@hooks/useIsMounted'
import { useGetMaximumExpireTime } from '@hooks/useUserMetadataRequests'
import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { ErrorMessage, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import Actions from '../Actions'
import { AutoResize } from '../ConsentResponse/AutoResize'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import { TimePicker } from '../TimePicker'
import styles from './index.module.css'

const Error = ({ name }: Readonly<{ name: string }>) => (
  <ErrorMessage name={name} component="div">
    {(msg) => (
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
  const isMounted = useIsMounted()

  const [amount, setAmount] = useState<number>()
  const [unit, setUnit] = useState<number>()

  const { getExpireTime } = useGetMaximumExpireTime()
  const [maximumExpireTime, setMaximumExpireTime] = useState<number>()

  useEffect(() => {
    getExpireTime().then((value) => isMounted && setMaximumExpireTime(value))
  }, [isMounted, getExpireTime])

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

        if (values.expiresInSeconds < 1) {
          errors.expiresInSeconds = 'Must be greater than 0'
        } else if (values.expiresInSeconds > maximumExpireTime) {
          errors.expiresInSeconds = `Exceeds maximum expire time: ${maximumExpireTime} seconds`
        }

        console.log(values.expiresInSeconds, maximumExpireTime)

        if (!values.permissions) return errors

        const permissions = Object.values(values.permissions)
        if (
          !permissions ||
          permissions.length < 1 ||
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

          <TimePicker
            amount={amount}
            setAmount={setAmount}
            unit={unit}
            setUnit={setUnit}
          />
          <Error name="expiresInSeconds" />

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
