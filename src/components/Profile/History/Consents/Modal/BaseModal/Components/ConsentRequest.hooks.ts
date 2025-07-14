import { PossibleRequests } from '@utils/consents/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const useConsentRequest = (
  interactive: boolean,
  values: PossibleRequests
) => {
  // const parsedValues = useMemo(() => values, [values])

  // Create all keys from parsedValues, defaulting to false
  const allNegative = useMemo(() => {
    return Object.fromEntries(
      Object.keys(values).map((key) => [key, false])
    ) as Partial<PossibleRequests>
  }, [values])

  const [val, setVal] = useState<Partial<PossibleRequests>>(() =>
    Object.keys(values).length > 0
      ? interactive
        ? allNegative
        : values
      : allNegative
  )

  const update = useCallback(
    (key: keyof PossibleRequests) => {
      if (!interactive) return
      setVal((prev) => ({
        ...prev,
        [key]: !prev[key]
      }))
    },
    [interactive]
  )

  useEffect(() => {
    const updated: Partial<PossibleRequests> =
      Object.keys(values).length > 0 ? values : allNegative

    setVal(interactive ? allNegative : updated)
  }, [allNegative, interactive, values])

  const getSimpleRequest = useCallback((key: keyof PossibleRequests) => {
    switch (key) {
      case 'trusted_algorithm_publisher':
        return 'Do you want to trust the publisher?'
      case 'trusted_algorithm':
        return 'Do you want to trust the algorithm usage?'
      case 'trusted_credential_address':
        return 'Trusted Credential Address'
      case 'allow_network_access':
        return 'Do you want to allow network access?'
    }
  }, [])

  return { val, update, getSimpleRequest }
}
