import { useConsents } from '@context/Profile/ConsentsProvider'
import Info from '@images/info.svg'
import ThumbsDown from '@images/thumbsdown.svg'
import ThumbsUp from '@images/thumbsup.svg'
import { ConsentState } from '@utils/consentsUser'
import { useEffect, useState } from 'react'
import styles from './ConsentRowActions.module.css'

interface Action {
  icon: JSX.Element
  title: string
  action: () => void
}

interface Props {
  consent: Consent
  type: 'outgoing' | 'incoming'
}

export default function ConsentRowActions({ consent, type }: Props) {
  const { updateSelected, setSelected, setIsInspect } = useConsents()

  const [actions, setActions] = useState<Action[]>()

  useEffect(() => {
    const getActions = (
      type: 'outgoing' | 'incoming',
      updateSelected: (ConsentState) => void,
      setIsInspect: (boolean) => void
    ): Action[] => {
      if (type === 'outgoing')
        return [
          {
            icon: <Info />,
            title: 'Inspect',
            action: () => setIsInspect(true)
          }
        ]

      return [
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
    }

    setActions(getActions(type, updateSelected, setIsInspect))
  }, [consent, type, updateSelected, setIsInspect])

  return (
    <div className={styles.actions}>
      {actions &&
        actions.map((action, index) => (
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
