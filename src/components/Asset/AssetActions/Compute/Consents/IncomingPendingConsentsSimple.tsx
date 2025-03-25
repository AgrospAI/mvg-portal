import { Asset } from '@oceanprotocol/lib'
import React, { useEffect, useState } from 'react'
import styles from './IncomingPendingConsentsSimple.module.css'
import { useConsents } from '@context/Profile/ConsentsProvider'
import { ConsentState } from '@utils/consentsUser'
import Publisher from '@components/@shared/Publisher'
import Ellipsis from '@images/ellipsis.svg'
import Cog from '@images/cog.svg'

interface Props {
  asset: Asset
}

export default function IncomingPendingConsentsSimple({ asset }: Props) {
  const { incoming, setSelected, setIsInspect } = useConsents()

  const [incomingForAsset, setIncomingForAsset] = useState<Consent[]>()

  useEffect(() => {
    if (!asset || !incoming) return

    const incomingForAsset = incoming.filter(
      (consent) =>
        consent.state == ConsentState.PENDING && consent.asset === asset.id
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
