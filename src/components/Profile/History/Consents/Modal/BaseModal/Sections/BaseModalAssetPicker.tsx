import { Asset, LoggerInstance } from '@oceanprotocol/lib'
import styles from './BaseModalAssetPicker.module.css'
import Eye from '@images/eye.svg'
import { useState } from 'react'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { useAssets } from '@hooks/useAssets'
import AssetPicker from '../Components/AssetPicker'
import { useLoadingIndicator } from '@hooks/useLoadingIndicator'

interface BaseModalAlgorithmPickerProps {
  address: string
  asset: Asset
  selected: Asset
  setSelected: (selected: Asset) => void
}

function BaseModalAlgorithmPicker({
  address,
  asset,
  selected,
  setSelected
}: BaseModalAlgorithmPickerProps) {
  const assetType = asset?.metadata.algorithm ? 'dataset' : 'algorithm'
  const assets = useAssets(address, assetType)
  const [error, setError] = useState('')
  const [written, setWritten] = useState<Asset>()
  const newCancelToken = useCancelToken()

  const [isLoading, setIsLoading] = useState(false)

  useLoadingIndicator(isLoading)

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()

    setError(undefined)
    setIsLoading(true)

    if (e.target.value) {
      try {
        setSelected(
          assets.data.results.filter((data) => data.id === e.target.value)[0]
        )
      } catch (error) {
        LoggerInstance.error(error)
        setSelected(undefined)
      }
    } else {
      setSelected(undefined)
    }
    setIsLoading(false)
  }

  const handleWrite = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    setIsLoading(true)
    const did = e.target.value.trim()

    if (!did) {
      setWritten(undefined)
      setIsLoading(false)
      return
    }

    getAsset(did, newCancelToken())
      .then((data) => {
        if (!data) {
          setWritten(undefined)
          setSelected(undefined)
          setError('Asset not found')
        } else {
          setWritten(data)
          setSelected(data)
          setError(undefined)
        }
      })
      .catch((error) => {
        console.log(error)
        LoggerInstance.error(error)
        setWritten(undefined)
        setError(error.message)
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div className={styles.container}>
      <span>
        What {asset?.metadata.algorithm ? 'dataset' : 'algorithm'} do you want
        to access this asset with?
      </span>
      <div className={styles.algorithmContainer}>
        <AssetPicker
          assets={assets}
          isWritten={!!written}
          className={styles.selector}
          handleSelectChange={handleSelectChange}
        />
        <i>-- or --</i>
        <input
          className={styles.reasonTextbox}
          name="algorithm-did"
          placeholder="did:op:6f3a2e2e63d603ecd37409b593960ae56404a4fe81c162292cc32f29e1f20db9"
          disabled={!!selected}
          onChange={handleWrite}
          maxLength={100}
        />
        {error && (
          <span className={styles.errorMessage}>
            <Eye className={styles.alert} />
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

export default BaseModalAlgorithmPicker
