import { useSuspenseQueries } from '@tanstack/react-query'
import { getVerifiablePresentation } from '@utils/verifiablePresentations/api'
import { PontusVerifiableCredentialArray } from '../@utils/verifiableCredentials/types'

export const useVerifiablePresentations = (
  credentials: PontusVerifiableCredentialArray
) =>
  useSuspenseQueries({
    queries: credentials.map(({ credentialUrl }) => ({
      queryKey: ['verifiable-presentation', credentialUrl],
      queryFn: async () => getVerifiablePresentation(credentialUrl)
    }))
  })
