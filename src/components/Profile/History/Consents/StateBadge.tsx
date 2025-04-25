import styles from './StateBadge.module.css'

interface Props {
  response?: string
}

export default function ConsentStateBadge({ response }: Props) {
  const state = response ? 'Responded' : 'Pending'

  return (
    <div
      className={`${styles.badge} ${styles[`badge-${state.toLowerCase()}`]}`}
    >
      {state}
    </div>
  )
}
