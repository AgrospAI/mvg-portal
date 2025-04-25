import styles from './StateBadge.module.css'

interface Props {
  status: ConsentState | null
}

export default function ConsentStateBadge({ status }: Props) {
  const state = status || 'Pending'

  return (
    <div
      className={`${styles.badge} ${styles[`badge-${state.toLowerCase()}`]}`}
    >
      {state}
    </div>
  )
}
