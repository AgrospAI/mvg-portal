import { PropsWithChildren } from 'react'
import styles from './ModalSection.module.css'

interface ModalSectionProps {
  title: string
  className?: string
}

export default function ModalSection({
  title,
  className,
  children
}: PropsWithChildren<ModalSectionProps>) {
  return (
    <fieldset className={`${styles.borderedElement} ${className}`}>
      <legend className={styles.legendTitle}>{title}</legend>
      {children}
    </fieldset>
  )
}
