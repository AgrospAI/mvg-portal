import classNames from 'classnames'
import { useCallback } from 'react'
import styles from './StateBadge.module.css'

const cx = classNames.bind(styles)

export const ConsentStateBadge = ({
  status
}: Readonly<{
  status?: MetadataRequest['status']
}>) => {
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
    <div className={cx(styles.badge, styles[`badge-${status}`])}>
      {mapStatusNumber(status)}
    </div>
  )
}

export default { ConsentStateBadge }
