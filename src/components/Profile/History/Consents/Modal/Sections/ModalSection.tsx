import { PropsWithChildren } from 'react'
import styles from './ModalSection.module.css'

interface ModalSectionProps {
  title: string
}

export default function ModalSection({
  title,
  children
}: PropsWithChildren<ModalSectionProps>) {
  return (
    <fieldset className={styles.borderedElement}>
      <legend className={styles.legendTitle}>{title}</legend>
      {children}
    </fieldset>
  )
}
