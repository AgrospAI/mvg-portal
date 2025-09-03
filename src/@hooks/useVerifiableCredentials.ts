import { useSuspenseQuery } from '@tanstack/react-query'
import { getAddressCredentials } from '@utils/verifiableCredentials/api'
import { Address } from 'wagmi'

export const useVerifiableCredentials = (address: Address) => {
  const { data } = useSuspenseQuery({
    queryKey: ['address-credentials', address],
    queryFn: async ({ signal }) => getAddressCredentials(address, signal)
  })

  return {
    data
  }
}
