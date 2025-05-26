import AssetLink from '@components/Profile/History/Consents/Modal/BaseModal/Components/AssetLink'
import InspectConsentModal from '@components/Profile/History/Consents/Modal/InspectConsentModal'
import { useModal } from '@context/Modal'
import { useUserIncomingConsents } from '@hooks/useUserConsents'
import Cog from '@images/cog.svg'
import { Asset } from '@oceanprotocol/lib'
import { Consent } from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import styles from './IncomingPendingConsentsSimple.module.css'
import classNames from 'classnames/bind'

interface Props {
  asset: Asset
}

export default function IncomingPendingConsentsSimple({ asset }: Props) {
  const { data: incoming } = useUserIncomingConsents()
  const { setSelected, setIsInteractive, openModal, setCurrentModal } =
    useModal()

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
                <div className={styles.actionContainer}>
                  <Cog
                    class={styles.action}
                    onClick={() => {
                      setCurrentModal(<InspectConsentModal consent={consent} />)
                      setSelected(consent)
                      setIsInteractive(isPending(consent))
                      openModal()
                    }}
                  />
                </div>
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
