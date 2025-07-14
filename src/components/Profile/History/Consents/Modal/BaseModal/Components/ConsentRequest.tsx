import { PossibleRequests } from '@utils/consents/types'
import { useConsentRequest } from './ConsentRequest.hooks'
import styles from './ConsentRequest.module.css'

interface ConsentRequestProps {
  values: PossibleRequests
  interactive?: boolean
  showAll?: boolean
}

function ConsentRequest({ values, interactive, showAll }: ConsentRequestProps) {
  const { val, update, getSimpleRequest } = useConsentRequest(
    interactive,
    values
  )

  const active =
    showAll || interactive
      ? Object.entries(val)
      : Object.entries(val).filter((value) => value)

  return (
    <>
      {active.map(([key, value]) => (
        <div key={key} className={styles.request}>
          <input
            className={`${styles.input_interactive} ${styles.interactive}`}
            id={key}
            name={key}
            type="checkbox"
            defaultChecked={!!value}
            onClick={() => update(key as keyof PossibleRequests)}
          />
          <label htmlFor={key} className={styles.interactive}>
            {getSimpleRequest(key as keyof PossibleRequests)}
          </label>
        </div>
      ))}
    </>
  )
}

export default ConsentRequest
