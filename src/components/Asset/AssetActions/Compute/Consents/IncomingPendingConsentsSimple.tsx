import AssetLink from '@components/Profile/History/Consents/Modal/Sections/AssetLink'
import { useConsents } from '@context/Profile/ConsentsProvider'
import Cog from '@images/cog.svg'
import { Asset } from '@oceanprotocol/lib'
import { ConsentState, ListConsent } from '@utils/consentsUser'
import { useEffect, useState } from 'react'
import styles from './IncomingPendingConsentsSimple.module.css'

interface Props {
  asset: Asset
}

export default function IncomingPendingConsentsSimple({ asset }: Props) {
  const { incoming, setSelected, setIsInspect, setIsInteractiveInspect } =
    useConsents()

  const [incomingForAsset, setIncomingForAsset] = useState<ListConsent[]>()

  useEffect(() => {
    if (!asset || !incoming) return

    const incomingForAsset = incoming.filter(
      (consent) =>
        (consent.status === ConsentState.PENDING || consent.status === null) &&
        consent.dataset.includes(asset.id)
    )

    setIncomingForAsset(incomingForAsset)
  }, [asset, incoming])

  return (
    <>
      {incomingForAsset?.length ? (
        <div className={styles.section}>
          <div className={styles.title}>Incoming consents</div>
          <div className={styles.container}>
            <div className={styles.consentList}>
              {incomingForAsset?.map((consent, index) => (
                <div key={index} className={styles.consentRow}>
                  <div className={styles.assetLinkContainer}>
                    <AssetLink
                      did={asset.id}
                      name={asset.metadata.name}
                      className={styles.assetLink}
                    />
                  </div>
                  <Cog
                    onClick={() => {
                      setSelected(consent)
                      setIsInteractiveInspect(
                        consent.status === ConsentState.PENDING ||
                          consent.status === null
                      )
                      setIsInspect(true)
                    }}
                    className={styles.action}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noConsents}>No incoming consents</div>
      )}
    </>
  )
}
