import { useAssets } from '@hooks/useAssets'
import { useCancelToken } from '@hooks/useCancelToken'
import Eye from '@images/eye.svg'
import Info from '@images/info.svg'
import { Asset, LoggerInstance } from '@oceanprotocol/lib'
import { getAsset } from '@utils/aquarius'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAccount } from 'wagmi'
import AssetPicker from '../AssetPicker'
import styles from './index.module.css'

interface AssetInputProps {
  asset: Asset
  selected: Asset
  setSelected: (selected: Asset) => void
}

function AssetInput({ asset, selected, setSelected }: AssetInputProps) {
  const { address } = useAccount()
  const assetType = asset?.metadata?.algorithm ? 'dataset' : 'algorithm'
  const { data: assets } = useAssets(address, assetType, asset.chainId)

  const [inputValue, setInputValue] = useState('')
  const [debouncedValue] = useDebounce(inputValue, 500)

  const [error, setError] = useState<string | undefined>()
  const [written, setWritten] = useState<Asset>()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const checkAsset = async () => {
      if (!debouncedValue) {
        setError(undefined)
        setWritten(undefined)
        return
      }

      try {
        const fetchedAsset = await getAsset(
          debouncedValue.trim(),
          newCancelToken()
        )

        if (!fetchedAsset) {
          setWritten(undefined)
          setSelected(undefined)
          setError('Asset not found')
        } else {
          setWritten(fetchedAsset)
          setSelected(fetchedAsset)
          setError(undefined)
        }
      } catch (err) {
        LoggerInstance.error(err)
        setWritten(undefined)
        setSelected(undefined)
        setError((err as Error).message)
      }
    }

    checkAsset()
  }, [debouncedValue, newCancelToken, setSelected])

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    setError(undefined)

    const id = e.target.value
    if (!id) {
      setSelected(undefined)
      return
    }

    const found = assets.results.find((data) => data.id === id)
    setSelected(found)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setInputValue(e.target.value)
  }

  return (
    <div className={styles.container}>
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
          placeholder="did:op:..."
          disabled={!!selected}
          onChange={handleInputChange}
          value={inputValue}
          maxLength={100}
        />
        {error && (
          <span className={`${styles.feedback} ${styles.errorMessage}`}>
            <Eye />
            {error}
          </span>
        )}
        {written && !error && (
          <span className={`${styles.feedback} ${styles.successMessage}`}>
            <Info />
            <code>{written.nft.name}</code>
          </span>
        )}
      </div>
    </div>
  )
}

export default AssetInput
