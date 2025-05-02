import Publisher from '@components/@shared/Publisher'
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
        consent.status === ConsentState.PENDING && consent.asset === asset.id
    )

    setIncomingForAsset(incomingForAsset)
  }, [incoming])

  return (
    <div className={styles.container}>
      {incomingForAsset?.length ? (
        <>
          <div className={styles.title}>Incoming consents</div>
          <div className={styles.consentList}>
            {incomingForAsset?.map((consent, index) => (
              <div key={index} className={styles.consentRow}>
                <Publisher account={consent.solicitor} showName={true} />
                <div
                  className={styles.action}
                  onClick={() => {
                    setSelected(consent)
                    setIsInteractiveInspect(
                      consent.state === ConsentState.PENDING
                    )
                    setIsInspect(true)
                  }}
                >
                  <Cog />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noConsents}>No incoming consents</div>
      )}
    </div>
  )
}
