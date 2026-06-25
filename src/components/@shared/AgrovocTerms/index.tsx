import { ReactElement } from 'react'
import styles from './index.module.css'

interface DcatTheme {
  '@id': string
  '@type': string
  'skos:prefLabel': { '@value': string; '@language': string } | string
}

function getLabel(theme: DcatTheme): string {
  const pref = theme['skos:prefLabel']
  if (typeof pref === 'string') return pref
  return pref?.['@value'] || ''
}

export default function AgrovocTerms({
  themes
}: {
  themes: DcatTheme[]
}): ReactElement | null {
  if (!themes?.length) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Concepts</h4>
      <ul className={styles.list}>
        {themes.map((theme) => (
          <li key={theme['@id']}>
            <a
              href={theme['@id']}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.term}
            >
              {getLabel(theme)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
