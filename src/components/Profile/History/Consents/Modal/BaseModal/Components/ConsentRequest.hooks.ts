import { PossibleRequests } from '@utils/consents/types'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const useConsentRequest = (interactive: boolean, values: string) => {
  const parsedValues: Partial<PossibleRequests> = useMemo(() => {
    return values ? JSON.parse(values) : {}
  }, [values])

  // Create all keys from parsedValues, defaulting to false
  const allNegative = useMemo(() => {
    return Object.fromEntries(
      Object.keys(parsedValues).map((key) => [key, false])
    ) as Partial<PossibleRequests>
  }, [parsedValues])

  const [val, setVal] = useState<Partial<PossibleRequests>>(() =>
    Object.keys(parsedValues).length > 0
      ? interactive
        ? allNegative
        : parsedValues
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
    const parsed: Partial<PossibleRequests> = values ? JSON.parse(values) : {}
    const updated: Partial<PossibleRequests> =
      Object.keys(parsed).length > 0 ? parsed : allNegative

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
