import styles from './VoteResults.module.css'

interface Props {
  subRequest: MetadataSubRequest
  totalWeight: number
}

export const VoteResults = ({ subRequest, totalWeight }: Props) => {
  // Prevent division by zero
  const safeTotal = totalWeight || 1
  const yesPercentage = (subRequest.yesWeight / safeTotal) * 100
  const noPercentage = (subRequest.noWeight / safeTotal) * 100

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <span className={styles.yesText}>Yes: {subRequest.yesWeight}</span>
        <span className={styles.noText}>No: {subRequest.noWeight}</span>
      </div>

      <div className={styles.barContainer}>
        {/* The "Yes" portion */}
        <div
          className={styles.yesBar}
          style={{ width: `${yesPercentage}%` }}
          title={`Yes: ${yesPercentage.toFixed(1)}%`}
        />
        {/* The "No" portion */}
        <div
          className={styles.noBar}
          style={{ width: `${noPercentage}%` }}
          title={`No: ${noPercentage.toFixed(1)}%`}
        />
      </div>

      <div className={styles.totalLabel}>Total Weight: {totalWeight}</div>
    </div>
  )
}
