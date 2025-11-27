import { ReactElement } from 'react'
import styles from './Footer.module.css'
import Markdown from '@shared/Markdown'
import Links from './Links'
import { useMarketMetadata } from '@context/MarketMetadata'

export default function Footer(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const { footer } = siteContent
  const { copyright } = footer

  return (
    <footer className={styles.footer}>
      <Links />
      <div className={styles.copyright}>
        <Markdown text={copyright} />
      </div>
    </footer>
  )
}
