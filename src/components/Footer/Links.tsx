import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import Button from '@shared/atoms/Button'
import styles from './Links.module.css'
import { useMarketMetadata } from '@context/MarketMetadata'

export default function Links(): ReactElement {
  const { appConfig } = useMarketMetadata()
  const { setShowPPC, privacyPolicySlug } = useUserPreferences()
  const cookies = useGdprMetadata()

  return (
    <div className={styles.links}>
      <Button to="/imprint" className={styles.link}>
        Contact
      </Button>
      <Button to={privacyPolicySlug} className={styles.link}>
        Privacy Policy
      </Button>
      <Button to="/cookies/en" className={styles.link}>
        Cookie Policy
      </Button>
      {appConfig.privacyPreferenceCenter === 'true' && (
        <Button
          className={styles.link}
          style="text"
          onClick={() => {
            setShowPPC(true)
          }}
        >
          {cookies.optionalCookies ? 'Cookie Settings' : 'Cookies'}
        </Button>
      )}
    </div>
  )
}
