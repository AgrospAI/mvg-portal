import React from 'react'
import ThumbsUp from '@images/thumbsup.svg'
import ThumbsDown from '@images/thumbsdown.svg'
import Info from '@images/info.svg'
import styles from './ConsentRowActions.module.css'
import { useConsents } from '@context/Profile/ConsentsProvider'
import { ConsentState } from '@utils/consentsUser'

interface Props {
  consent: Consent
}

export default function ConsentRowActions({ consent }: Props) {
  const { updateSelected, setSelected, setIsInspect } = useConsents()

  const actions = [
    {
      icon: <ThumbsUp />,
      title: 'Accept',
      action: () => updateSelected(ConsentState.ACCEPTED)
    },
    {
      icon: <ThumbsDown />,
      title: 'Reject',
      action: () => updateSelected(ConsentState.REJECTED)
    },
    {
      icon: <Info />,
      title: 'Inspect',
      action: () => setIsInspect(true)
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
