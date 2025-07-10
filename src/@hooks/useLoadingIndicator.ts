import { useEffect } from 'react'

export const useLoadingIndicator = (isLoading: boolean) => {
  useEffect(() => {
    document.body.style.cursor = isLoading ? 'wait' : 'default'
    return () => {
      document.body.style.cursor = 'default'
    }
  }, [isLoading])
}
