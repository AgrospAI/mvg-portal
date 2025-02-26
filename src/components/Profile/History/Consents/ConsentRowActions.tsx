import React from 'react'
import ThumbsUp from '@images/thumbsup.svg'
import ThumbsDown from '@images/thumbsdown.svg'
import Info from '@images/info.svg'
import styles from './ConsentRowActions.module.css'
import { useUserConsents } from '@context/Profile/ConsentsProvider'

export default function ConsentRowActions({ consent }: { consent: Consent }) {
  const {
    setSelected,
    acceptSelectedConsent,
    rejectSelectedConsent,
    setInspect
  } = useUserConsents()

  const actions = [
    {
      icon: <ThumbsUp />,
      title: 'Accept',
      action: acceptSelectedConsent
    },
    {
      icon: <ThumbsDown />,
      title: 'Reject',
      action: rejectSelectedConsent
    },
    {
      icon: <Info />,
      title: 'Inspect',
      action: () => setInspect(true)
    }
  ]

  return (
    <div className={styles.actions}>
      {actions.map((action, index) => (
        <div
          className={`${styles.item}`}
          aria-label={action.title}
          title={action.title}
          key={index}
          onClick={() => {
            setSelected(consent)
            action.action()
          }}
        >
          {action.icon}
        </div>
      ))}
    </div>
  )
}
