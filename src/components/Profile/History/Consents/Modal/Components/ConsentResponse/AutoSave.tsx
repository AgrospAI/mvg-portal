import { useFormikContext } from 'formik'
import { useEffect } from 'react'

interface AutoSaveProps<DataT> {
  onChange: (values: DataT) => void
}

export const AutoSave = <DataT,>({
  onChange
}: Readonly<AutoSaveProps<DataT>>) => {
  const { values } = useFormikContext<DataT>()

  useEffect(() => onChange(values), [values, onChange])

  return null
}
