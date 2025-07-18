import { PropsWithChildren } from 'react'
import styles from './index.module.css'

interface ReasonProps {
  text?: string
}

function Reason({
  text = 'Reason provided',
  children
}: PropsWithChildren<ReasonProps>) {
  if (!children) return <></>

  return (
    <>
      <fieldset className={styles.reason}>
        <legend className={styles.reasonTitle}>{text}</legend>
        {children}
      </fieldset>
    </>
  )
}

export default Reason
