import { useConsents } from '@context/Profile/ConsentsProvider'
import Info from '@images/info.svg'
import { useEffect, useState } from 'react'
import styles from './ConsentRowActions.module.css'

interface Action {
  icon: JSX.Element
  title: string
  action: () => void
}

interface Props {
  consent: ListConsent
  type: 'outgoing' | 'incoming'
}

export default function ConsentRowActions({ consent, type }: Props) {
  const { setSelected, setIsInspect, setIsInteractiveInspect } = useConsents()

  const [actions, setActions] = useState<Action[]>()

  useEffect(() => {
    const getActions = (
      type: 'outgoing' | 'incoming',
      setIsInspect: (_: boolean) => void
    ): Action[] => {
      return [
        {
          icon: <Info />,
          title: 'Inspect',
          action: () => {
            setIsInspect(true)
            setIsInteractiveInspect(type !== 'outgoing')
          }
        }
      ]
    }

    setActions(getActions(type, setIsInspect))
  }, [consent, type, setIsInspect])

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
