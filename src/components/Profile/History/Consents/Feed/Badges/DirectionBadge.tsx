import Download from '@images/download.svg'
import { isIncoming } from '@utils/consents/utils'
import styles from './DirectionBadge.module.css'

const Outgoing = () => (
  <>
    <span>Outgoing</span>
    <span className={styles.rotate}>
      <Download />
    </span>
  </>
)
const Incoming = () => (
  <>
    <span>Incoming</span>
    <Download />
  </>
)

export const DirectionBadge = ({
  request,
  userAddress
}: Readonly<{ request: MetadataRequest; userAddress: string }>) => (
  <div className={styles.badge}>
    {isIncoming(request, userAddress) ? <Incoming /> : <Outgoing />}
  </div>
)
export default { DirectionBadge }
