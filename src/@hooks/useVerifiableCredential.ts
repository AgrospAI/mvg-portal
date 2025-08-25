import { useSuspenseQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback } from 'react'

export const useVerifiableCredential = (url: string) => {
  const fetchCredential = useCallback(
    async (): Promise<string> =>
      axios
        .get(url)
        .then(({ data }) => data)
        .catch(() => 'None'),
    [url]
  )

  const { data } = useSuspenseQuery({
    queryKey: ['credentials', url],
    queryFn: fetchCredential
  })

  return {
    data
  }
}
