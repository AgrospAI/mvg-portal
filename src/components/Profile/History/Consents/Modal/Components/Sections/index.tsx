import { PropsWithChildren } from 'react'
import styles from './index.module.css'

function Sections({ children }: PropsWithChildren) {
  return <div className={styles.sections}>{children}</div>
}

function Section({ children }: PropsWithChildren) {
  return <fieldset className={styles.section}>{children}</fieldset>
}

function SectionTitle({ children }: PropsWithChildren) {
  return <legend className={styles.title}>{children}</legend>
}

Sections.Section = Section
Sections.SectionTitle = SectionTitle

export default Sections
