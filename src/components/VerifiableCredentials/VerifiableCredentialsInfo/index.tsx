import Info from '@images/info.svg'
import Cross from '@images/x-cross.svg'
import classNames from 'classnames/bind'
import { type ReactNode } from 'react'
import styles from './index.module.css'

const cx = classNames.bind(styles)

type Variants = 'info' | 'warn'
interface VerifiableCredentialsInfoProps {
  variant: Variants
  children?: ReactNode
}

export const VerifiableCredentialsInfo = ({
  variant,
  children
}: Readonly<VerifiableCredentialsInfoProps>) => {
  const styleClasses = cx({
    base: true,
    info: variant === 'info',
    warn: variant === 'warn'
  })

  return (
    <div className={styleClasses}>
      {variant === 'info' ? <Info /> : <Cross />}
      {children}
    </div>
  )
}
