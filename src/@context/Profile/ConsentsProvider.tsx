import { useCancelToken } from '@hooks/useCancelToken'
import { LoggerInstance } from '@oceanprotocol/lib'
import {
  ConsentState,
  getUserConsents,
  getUserConsentsAmount,
  getUserIncomingConsents,
  getUserOutgoingConsents,
  updateConsent
} from '@utils/consentsUser'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount } from 'wagmi'
import ReasonModal from './ReasonModal'

export interface ConsentsProviderValue {
  incoming: Consent[]
  outgoing: Consent[]
  incomingPending: number
  outgoingPending: number
  isOnlyPending: boolean
  isLoading: boolean
  refetch: boolean
  setSelected: (consent: Consent) => void
  setRefetch: (value: boolean) => void
  setInspect: (value: boolean) => void
  setIsOnlyPending: (value: boolean) => void
  acceptSelectedConsent: () => void
  rejectSelectedConsent: () => void
}

const refreshInterval = 20000

const AccountConsentContext = createContext({} as ConsentsProviderValue)

function AccountConsentsProvider({ children }) {
  const { address: public_key } = useAccount()

  const [incomingPendingConsents, setIncomingPendingConsents] = useState(0)
  const [outgoingPendingConsents, setOutgoingPendingConsents] = useState(0)

  const [incomingConsentsCache, setIncomingConsentsCache] = useState<Consent[]>(
    []
  )
  const [outgoingConsentsCache, setOutgoingConsentsCache] = useState<Consent[]>(
    []
  )

  const [refetchConsents, setRefetchConsents] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnlyPending, setIsOnlyPending] = useState(false)
  const [inspect, setInspect] = useState(false)

  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [incomingConsents, setIncomingConsents] = useState<Consent[]>([])
  const [outgoingConsents, setOutgoingConsents] = useState<Consent[]>([])

  const newCancelToken = useCancelToken()

  // Periodic fetching of user consents amount
  const fetchUserConsentsAmount = useCallback(
    async (type: string) => {
      if (!public_key) return

      type === 'init' && setIsLoading(true)

      getUserConsentsAmount(public_key)
        .then((data) => {
          setIncomingPendingConsents(data.incoming_pending_consents)
          setOutgoingPendingConsents(data.outgoing_pending_consents)
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    },
    [public_key, newCancelToken]
  )

  useEffect(() => {
    const filterPendingConsents = (consents: Consent[]) =>
      consents?.filter((consent) => consent.state === ConsentState.PENDING) ||
      []

    // Always set a value, avoiding any conditional skipping
    setIncomingConsents(
      isOnlyPending
        ? filterPendingConsents(incomingConsentsCache)
        : incomingConsentsCache ?? []
    )

    setOutgoingConsents(
      isOnlyPending
        ? filterPendingConsents(outgoingConsentsCache)
        : outgoingConsentsCache ?? []
    )
  }, [isOnlyPending, incomingConsentsCache, outgoingConsentsCache])

  useEffect(() => {
    fetchUserConsentsAmount('init')

    // init periodic refresh for consents
    const consentsAmountInterval = setInterval(
      () => fetchUserConsentsAmount('repeat'),
      refreshInterval
    )

    return () => {
      clearInterval(consentsAmountInterval)
    }
  }, [public_key])

  useEffect(() => {
    const fetchUserConsents = async () => {
      if (!public_key) return
      setIsLoading(true)

      getUserConsents(public_key)
        .then((data) => {
          setIncomingConsentsCache(
            data.filter((consent) => consent.owner === public_key)
          )
          setOutgoingConsentsCache(
            data.filter((consent) => consent.solicitor === public_key)
          )
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    }

    fetchUserConsents()
  }, [public_key, refetchConsents])

  useEffect(() => {
    setIncomingConsents(incomingConsentsCache)
    setOutgoingConsents(outgoingConsentsCache)
  }, [incomingConsentsCache, outgoingConsentsCache])

  // Fetch user incoming consents on mount and when incomingPendingConsents changes
  useEffect(() => {
    const fetchUserConsents = async () => {
      if (!public_key) return

      setIsLoading(true)

      getUserIncomingConsents(public_key)
        .then((data) => {
          setIncomingConsentsCache(data)
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    }

    fetchUserConsents()
  }, [public_key, incomingPendingConsents])

  // Fetch user outgoing consents on mount and when outgoingPendingConsents changes
  useEffect(() => {
    const fetchUserConsents = async () => {
      if (!public_key) return

      setIsLoading(true)

      getUserOutgoingConsents(public_key)
        .then((data) => {
          setOutgoingConsentsCache(data)
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    }

    fetchUserConsents()
  }, [public_key, outgoingPendingConsents])

  const updateSelectedConsent = async (state: ConsentState) => {
    if (!selectedConsent) return

    const { state: newState } = await updateConsent(selectedConsent.id, state)

    setSelectedConsent((prev) => ({ ...prev, state: newState }))
    // Also update it in the cache
    if (selectedConsent.owner === public_key) {
      setIncomingConsentsCache(
        incomingConsentsCache.map((consent) =>
          consent.id === selectedConsent.id
            ? { ...consent, state: newState }
            : consent
        )
      )
    } else {
      setOutgoingConsentsCache(
        outgoingConsentsCache.map((consent) =>
          consent.id === selectedConsent.id
            ? { ...consent, state: newState }
            : consent
        )
      )
    }
  }

  const acceptSelected = () => updateSelectedConsent(ConsentState.ACCEPTED)
  const rejectSelected = () => updateSelectedConsent(ConsentState.REJECTED)

  return (
    <AccountConsentContext.Provider
      value={{
        incoming: incomingConsents,
        outgoing: outgoingConsents,
        incomingPending: incomingPendingConsents,
        isOnlyPending,
        setIsOnlyPending,
        outgoingPending: outgoingPendingConsents,
        setSelected: setSelectedConsent,
        isLoading,
        refetch: refetchConsents,
        setRefetch: setRefetchConsents,
        setInspect,
        acceptSelectedConsent: acceptSelected,
        rejectSelectedConsent: rejectSelected
      }}
    >
      {children}
      <ReasonModal
        consentPetition={selectedConsent}
        disabled={isLoading}
        inspect={inspect}
        disableReasonInspect={() => {
          setSelectedConsent(null)
          setInspect(false)
        }}
        onAcceptConfirm={acceptSelected}
        onRejectConfirm={rejectSelected}
      />
    </AccountConsentContext.Provider>
  )
}

const useUserConsents = (): ConsentsProviderValue =>
  useContext(AccountConsentContext)

export { AccountConsentContext, AccountConsentsProvider, useUserConsents }
export default AccountConsentsProvider
