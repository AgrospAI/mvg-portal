import { ReactNode } from 'react'
import { useBaseModal } from '../BaseModal'
import styles from './BaseModalSection.module.css'

interface BaseModalSectionProps {
  title: string
  children: ReactNode
}

function BaseModalSection({ title, children }: BaseModalSectionProps) {
  useBaseModal()

  return (
    <div className={styles.container}>
      <fieldset className={styles.borderedElement}>
        <legend className={styles.legendTitle}>{title}</legend>
        {children}
      </fieldset>
    </div>
  )
}

export default BaseModalSection
