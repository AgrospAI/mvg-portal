import Time from '@components/@shared/atoms/Time'
import Modal from '@components/@shared/Modal'
import { InspectModal } from '@components/Profile/History/Consents/Feed/Actions/Buttons/InspectConsent'
import AssetLink from '@components/Profile/History/Consents/Modal/Components/AssetLink'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { Asset } from '@oceanprotocol/lib'
import { getUserVote, isFinished, isPending } from '@utils/consents/utils'
import { useAccount } from 'wagmi'
import styles from './IncomingPendingConsentsSimple.module.css'

export default function IncomingPendingConsentsSimple({
  asset
}: Readonly<{
  asset: Asset
}>) {
  const { address } = useAccount()
  const { requests } = useMetadataRequests()

  const filtered =
    requests?.filter(
      (request) =>
        isPending(request) &&
        !isFinished(request) &&
        request.dataset.did.toLowerCase() === asset.id.toLowerCase() &&
        !getUserVote(request.votes, address)
    ) || []

  if (filtered?.length === 0)
    return <div className={styles.noConsents}>No incoming consents</div>

  return (
    <div className={styles.section}>
      <div className={styles.title}>Incoming petitions</div>
      <div className={styles.consentList}>
        {filtered.map((request) => (
          <div key={request.id}>
            <div className={styles.consentRow}>
              <div className={styles.consentDetail}>
                <AssetLink
                  did={request.algorithm.did}
                  className={styles.assetLink}
                  isArrow
                />
                <div className={styles.description}>
                  <span>{filtered.length} request(s)</span>
                  <span>|</span>
                  <Time date={request.createdAt.toString()} isUnix relative />
                </div>
              </div>
              <Modal>
                <InspectModal request={request} />
              </Modal>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
