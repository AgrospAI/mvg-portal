import Button from '@components/@shared/atoms/Button'
import React from 'react'
import styles from './ConsentPetitionButton.module.css'
import { useConsentsPetition } from '@context/Profile/ConsentsPetitionProvider'

export default function ConsentPetitionButton() {
  const { setIsStartPetition } = useConsentsPetition()

  return (
    <div>
      <span className={styles.requestButtonContainer}>
        Your algorithm isn't listed?
        <Button
          style="text"
          size="small"
          title="Refresh consents"
          type="button"
          onClick={() => setIsStartPetition(true)}
          className={styles.requestButton}
        >
          Make petition
        </Button>
      </span>
    </div>
  )
}
