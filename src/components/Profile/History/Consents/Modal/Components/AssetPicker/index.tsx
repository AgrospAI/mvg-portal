interface AssetPickerProps {
  assets: PagedAssets
  isWritten: boolean
  className: string
  handleSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

function AssetPicker({
  assets,
  isWritten,
  className,
  handleSelectChange
}: AssetPickerProps) {
  return (
    <select
      name="algorithm"
      id="algorithm-select"
      onChange={handleSelectChange}
      className={className}
      disabled={!!isWritten}
    >
      {assets.results ? (
        <>
          <option value="">--Please choose one of your assets--</option>
          {assets.results.map((item) => (
            <option key={item.id} value={item.id}>
              {item.metadata.name}
            </option>
          ))}
        </>
      ) : (
        <option value="">No assets found</option>
      )}
    </select>
  )
}

export default AssetPicker
