import { useCancelToken } from '@hooks/useCancelToken'
import AssetSelection, {
  AssetSelectionAsset
} from '@shared/FormInput/InputElement/AssetSelection'
import { getAlgorithmDatasetsForCompute } from '@utils/aquarius'
import { getServiceByName } from '@utils/ddo'
import { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import styles from './AlgorithmDatasetsListForCompute.module.css'

export default function AssetComputeSelectionSearch({
  asset,
  algorithmDid,
  selectedDatasets,
  setSelectedDatasets
}: {
  asset: AssetExtended
  algorithmDid: string
  selectedDatasets: string[]
  setSelectedDatasets: (datasets: string[]) => void
}): ReactElement {
  const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()
  const [datasetsForCompute, setDatasetsForCompute] =
    useState<AssetSelectionAsset[]>()

  useEffect(() => {
    if (!asset || !asset?.accessDetails?.type) return

    async function getDatasetsAllowedForCompute() {
      const isCompute = !!getServiceByName(asset, 'compute')
      const datasetComputeService = getServiceByName(
        asset,
        isCompute ? 'compute' : 'access'
      )
      const datasets = await getAlgorithmDatasetsForCompute(
        algorithmDid,
        asset.nft.owner,
        datasetComputeService?.serviceEndpoint,
        accountId,
        asset?.chainId,
        newCancelToken()
      )

      // Do not render repeated and also do not render
      setDatasetsForCompute(datasets)

      // .filter(
      //   (dataset, index, self) =>
      //     index === self.findIndex((d) => d.did === dataset.did)
      // )
    }
    asset.metadata.type === 'algorithm' && getDatasetsAllowedForCompute()
  }, [accountId, asset, algorithmDid, newCancelToken])

  function handleSelectionChange(e: ChangeEvent<HTMLInputElement>) {
    const assetId = e.target.value
    const isChecked = e.target.checked
    if (isChecked) {
      setSelectedDatasets([...selectedDatasets, assetId])
    } else {
      setSelectedDatasets(selectedDatasets.filter((id) => id !== assetId))
    }
  }

  function handleSelectAll(e: ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked
    if (isChecked && datasetsForCompute) {
      setSelectedDatasets(datasetsForCompute.map((a) => a.did))
    } else {
      setSelectedDatasets([])
    }
  }

  const isAllSelected =
    datasetsForCompute &&
    datasetsForCompute.length > 0 &&
    selectedDatasets.length === datasetsForCompute.length

  return (
    <div className={styles.datasetsContainer}>
      <label htmlFor="selectAll">Select datasets to start a compute job</label>
      {datasetsForCompute && datasetsForCompute.length > 0 && (
        <div className={styles.selectAll}>
          <input
            id="selectAll"
            type="checkbox"
            className={styles.checkbox}
            onChange={handleSelectAll}
            checked={isAllSelected}
          />
          <label htmlFor="selectAll">
            Select all ({datasetsForCompute.length || 0})
          </label>
        </div>
      )}
      <AssetSelection
        assets={datasetsForCompute}
        selected={selectedDatasets}
        multiple
        onChange={handleSelectionChange}
      />
    </div>
  )
}
