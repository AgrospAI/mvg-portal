import Loader from '@components/@shared/atoms/Loader'
import Modal from '@components/@shared/Modal'
import AssetLink from '@components/Profile/History/Consents/Modal/Components/AssetLink'
import InspectConsentsModal from '@components/Profile/History/Consents/Modal/InspectConsentsModal'
import { useUserIncomingConsents } from '@hooks/useUserConsents'
import Cog from '@images/cog.svg'
import { Asset } from '@oceanprotocol/lib'
import { Consent } from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import { Suspense } from 'react'
import styles from './IncomingPendingConsentsSimple.module.css'

interface Props {
  asset: Asset
}

export default function IncomingPendingConsentsSimple({ asset }: Props) {
  const { data: incoming } = useUserIncomingConsents()

  const incomingForAsset = incoming.filter(
    (consent: Consent) =>
      isPending(consent) && consent.dataset.includes(asset.id)
  )

  return (
    <>
      {incomingForAsset?.length ? (
        <div className={styles.section}>
          <div className={styles.title}>Incoming consents</div>
          <div className={styles.consentList}>
            {incomingForAsset?.map((consent, index) => (
              <div key={index} className={styles.consentRow}>
                <AssetLink
                  did={consent.algorithm}
                  className={styles.assetLink}
                />
                <Modal.Trigger name={asset.nft.address}>
                  <div className={styles.actionContainer}>
                    <Cog class={styles.action} />
                  </div>
                </Modal.Trigger>
                <Modal.Content name={asset.nft.address}>
                  <Suspense fallback={<Loader />}>
                    <InspectConsentsModal />
                  </Suspense>
                </Modal.Content>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noConsents}>No incoming consents</div>
      )}
    </>
  )
}
