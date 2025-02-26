import React from 'react'
import styles from './StateBadge.module.css'

interface Props {
  state: ConsentState
}

export default function ConsentStateBadge({ state }: Props) {
  return (
    <div
      className={`${styles.badge} ${styles[`badge-${state.toLowerCase()}`]}`}
    >
      {state}
    </div>
  )
}
