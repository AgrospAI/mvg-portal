import { useBaseModal } from '../BaseModal'
import styles from './BaseModalSeparator.module.css'

function BaseModalSeparator() {
  useBaseModal()

  return <hr className={styles.separator} />
}

export default BaseModalSeparator
