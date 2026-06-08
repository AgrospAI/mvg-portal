import { ReactElement } from 'react'
import FormStartComputeDataset, {
  FormStartComputeProps
} from './FormComputeDataset'

export default function FormStartComputeAlgorithm(
  props: FormStartComputeProps
): ReactElement {
  return <FormStartComputeDataset {...props} showAlgorithmField={false} />
}
