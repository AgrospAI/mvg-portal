import { useCancelToken } from '@hooks/useCancelToken'
import { LoggerInstance } from '@oceanprotocol/lib'
import {
  getUserConsents,
  getUserConsentsAmount,
  getUserIncomingConsents,
  getUserOutgoingConsents
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
  isLoading: boolean
  refetch: boolean
  setSelected: (consent: Consent) => void
  setRefetch: (value: boolean) => void
}

const refreshInterval = 20000

const AccountConsentContext = createContext({} as ConsentsProviderValue)

function AccountConsentsProvider({ children }) {
  const { address: public_key } = useAccount()

  const [hasReasonInspect, setHasReasonInspect] = useState(false)
  const [incomingPendingConsents, setIncomingPendingConsents] = useState(0)
  const [outgoingPendingConsents, setOutgoingPendingConsents] = useState(0)
  const [refetchConsents, setRefetchConsents] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [incomingConsents, setIncomingConsents] = useState<Consent[]>([])
  const [outgoingConsents, setOutgoingConsents] = useState<Consent[]>([])

  const newCancelToken = useCancelToken()

  // Periodic fetching of user consents amount
  const fetchUserConsentsAmount = useCallback(
    async (type: string) => {
      if (!public_key) {
        return
      }

      try {
        type === 'init' && setIsLoading(true)

        const userConsentsData = await getUserConsentsAmount(public_key)

        setIncomingPendingConsents(userConsentsData.incoming_pending_consents)
        setOutgoingPendingConsents(userConsentsData.outgoing_pending_consents)

        setIsLoading(false)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoading(false)
      }
    },
    [public_key, newCancelToken]
  )

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
      if (!public_key) {
        return
      }
      setIsLoading(true)

      try {
        const consentsData = await getUserConsents(public_key)
        setIncomingConsents(
          consentsData.filter((consent) => consent.owner === public_key)
        )
        setOutgoingConsents(
          consentsData.filter((consent) => consent.solicitor === public_key)
        )
      } catch (error) {
        LoggerInstance.error(error.message)
      }
      setIsLoading(false)
    }

    fetchUserConsents()
  }, [public_key, refetchConsents])

  // Fetch user incoming consents on mount and when incomingPendingConsents changes
  useEffect(() => {
    const fetchUserConsents = async () => {
      if (!public_key) {
        return
      }
      setIsLoading(true)

      try {
        const consentsData = await getUserIncomingConsents(public_key)
        setIncomingConsents(consentsData)
      } catch (error) {
        LoggerInstance.error(error.message)
      }
      setIsLoading(false)
    }
    fetchUserConsents()
  }, [public_key, incomingPendingConsents])

  // Fetch user outgoing consents on mount and when outgoingPendingConsents changes
  useEffect(() => {
    const fetchUserConsents = async () => {
      if (!public_key) {
        return
      }
      setIsLoading(true)

      try {
        const consentsData = await getUserOutgoingConsents(public_key)
        setOutgoingConsents(consentsData)
      } catch (error) {
        LoggerInstance.error(error.message)
      }
      setIsLoading(false)
    }
    fetchUserConsents()
  }, [public_key, outgoingPendingConsents])

  const acceptConsent = async () => {}
  const rejectConsent = async () => {}

  return (
    <AccountConsentContext.Provider
      value={{
        incoming: incomingConsents,
        outgoing: outgoingConsents,
        incomingPending: incomingPendingConsents,
        outgoingPending: outgoingPendingConsents,
        setSelected: setSelectedConsent,
        isLoading,
        refetch: refetchConsents,
        setRefetch: setRefetchConsents
      }}
    >
      {children}
      <ReasonModal
        consentPetition={selectedConsent}
        disabled={isLoading}
        hasReasonInspect={hasReasonInspect}
        setHasReasonInspect={setHasReasonInspect}
        onAcceptConfirm={acceptConsent}
        onRejectConfirm={rejectConsent}
      />
    </AccountConsentContext.Provider>
  )
}

const useUserConsents = (): ConsentsProviderValue =>
  useContext(AccountConsentContext)

export { AccountConsentContext, AccountConsentsProvider, useUserConsents }
export default AccountConsentsProvider
