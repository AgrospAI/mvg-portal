import { useQuery } from '@tanstack/react-query'
import { getAsset } from '@utils/aquarius'
import { Consent } from '@utils/consents/types'
import { extractDidFromUrl } from '@utils/consents/utils'
import axios from 'axios'

export function useListConsent(consent: Consent) {
  const datasetQuery = useQuery({
    queryKey: ['asset', consent.dataset],
    queryFn: ({ signal }) => {
      const { CancelToken } = axios
      const source = CancelToken.source()

      const promise = getAsset(extractDidFromUrl(consent.dataset), source.token)

      signal?.addEventListener('abort', () => {
        source.cancel('Query was cancelled')
      })

      return promise
    }
  })

  const algorithmQuery = useQuery({
    queryKey: ['asset', consent.algorithm],
    queryFn: ({ signal }) => {
      const { CancelToken } = axios
      const source = CancelToken.source()

      const promise = getAsset(extractDidFromUrl(consent.dataset), source.token)

      signal?.addEventListener('abort', () => {
        source.cancel('Query was cancelled')
      })

      return promise
    }
  })

  return {
    datasetQuery,
    algorithmQuery
  }
}
