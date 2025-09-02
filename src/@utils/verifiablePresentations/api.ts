import axios from 'axios'
import { GaiaXVerifiablePresentationSchema } from './schemas'
import { GaiaXVerifiablePresentation } from './types'

export const getVerifiablePresentation = (url: string) =>
  url
    ? axios
        .get(url)
        .then(({ data }) => GaiaXVerifiablePresentationSchema.parse(data))
        .catch((error) => {
          console.error(error)
          throw error
        })
    : Promise.resolve({} as GaiaXVerifiablePresentation)
