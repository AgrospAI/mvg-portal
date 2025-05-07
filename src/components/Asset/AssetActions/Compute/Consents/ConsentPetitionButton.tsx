import Button from '@components/@shared/atoms/Button'
import { useConsentsPetition } from '@context/Profile/ConsentsPetitionProvider'
import axios from 'axios'
import { useEffect } from 'react'
import styles from './ConsentPetitionButton.module.css'
import { getAssetsNames } from '@utils/aquarius'

interface Props {
  asset: AssetExtended
}

export default function ConsentPetitionButton({ asset }: Props) {
  const { setIsStartPetition, setDataset } = useConsentsPetition()

  // useEffect(() => {
  //   if (!asset) return

  //   const source = axios.CancelToken.source()

  //   async function getAssetName(did: string) {
  //     const title = await getAssetsNames([did], source.token)
  //     return title[did]
  //   }

  //   getAssetName(asset.nft.address).then((data) => {})

  //   return () => {
  //     source.cancel()
  //   }
  // }, [asset])

  return (
    <div>
      <span className={styles.requestButtonContainer}>
        Your algorithm is not listed?
        <Button
          style="text"
          size="small"
          title="Refresh consents"
          type="button"
          onClick={() => {
            setIsStartPetition(true)
            setDataset(asset)
          }}
          className={styles.requestButton}
        >
          Make petition
        </Button>
      </span>
    </div>
  )
}
