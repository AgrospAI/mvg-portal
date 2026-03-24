import { useCallback } from 'react'
import styles from './StateBadge.module.css'

interface Props {
  status?: MetadataRequest['status']
}

export default function ConsentStateBadge({ status }: Props) {
  const mapStatusNumber = useCallback((status: MetadataRequest['status']) => {
    switch (status) {
      case 0:
        return 'Pending'
      case 1:
        return 'Cancelled'
      case 2:
        return 'Approved'
      case 3:
        return 'Resolved'
      case 4:
        return 'Rejected'
      default:
        return 'Unknown'
    }
  }, [])

  return (
    <div className={`${styles.badge} ${styles[`badge-${status}`]}`}>
      {mapStatusNumber(status)}
    </div>
  )
}
