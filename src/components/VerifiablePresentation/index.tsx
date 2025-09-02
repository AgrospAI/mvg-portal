import { GaiaXVerifiablePresentation } from '@utils/verifiablePresentations/types'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import styles from './index.module.css'

interface VerifiablePresentationProperties {
  verifiablePresentation: GaiaXVerifiablePresentation
}

export const VerifiablePresentation = ({
  verifiablePresentation
}: Readonly<VerifiablePresentationProperties>): JSX.Element => {
  return (
    <code>
      <JsonView src={verifiablePresentation} className={styles.contents} />
    </code>
  )
}
