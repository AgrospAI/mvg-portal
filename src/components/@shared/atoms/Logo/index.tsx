import { ReactElement } from 'react'
import LogoAsset from '@images/tareando-logo-horizontal.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return <LogoAsset className={styles.logo} />
}
