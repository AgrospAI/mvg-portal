import { LoggerInstance } from '@oceanprotocol/lib'
import { getUserConsentsAmount } from '@utils/consentsUser'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount } from 'wagmi'
import ReasonModal from '../../components/Profile/History/Consents/Modal/ReasonModal'
import ConsentsProvider from './ConsentsProvider'

interface AccountConsentsProviderValue {
  incomingPending: number
  outgoingPending: number
  solicitedPending: number
  isLoading: boolean
  isRefetch: boolean
  isIncomingRefetch: boolean
  isOutgoingRefetch: boolean
  isSolicitedRefetch: boolean
  setIsLoading: (value: boolean) => void
  setIsRefetch: (value: boolean) => void
  setIsIncomingRefetch: (value: boolean) => void
  setIsOutgoingRefetch: (value: boolean) => void
  setIsSolicitedRefetch: (value: boolean) => void
}

const refreshInterval = 20000

const AccountConsentContext = createContext({} as AccountConsentsProviderValue)

function AccountConsentsProvider({ children }) {
  const { address } = useAccount()

  const [incomingPending, setIncomingPending] = useState(0)
  const [outgoingPending, setOutgoingPending] = useState(0)
  const [solicitedPending, setSolicitedPending] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isRefetch, setIsRefetch] = useState(true)
  const [isIncomingRefetch, setIsIncomingRefetch] = useState(false)
  const [isOutgoingRefetch, setIsOutgoingRefetch] = useState(false)
  const [isSolicitedRefetch, setIsSolicitedRefetch] = useState(false)

  // Periodic fetching of user consents amount
  const fetchUserConsentsAmount = useCallback(
    async (type: string) => {
      if (!address) return

      type === 'init' && setIsLoading(true)

      getUserConsentsAmount(address)
        .then((data) => {
          if (data.incoming_pending_consents !== incomingPending)
            setIsIncomingRefetch(true)
          if (data.outgoing_pending_consents !== outgoingPending)
            setIsOutgoingRefetch(true)
          if (data.solicited_pending_consents !== solicitedPending)
            setIsSolicitedRefetch(true)

          setIncomingPending(data.incoming_pending_consents)
          setOutgoingPending(data.outgoing_pending_consents)
          setSolicitedPending(data.solicited_pending_consents)
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    },
    [address, incomingPending, outgoingPending, solicitedPending]
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
  }, [address, fetchUserConsentsAmount])

  return (
    <AccountConsentContext.Provider
      value={{
        incomingPending,
        outgoingPending,
        solicitedPending,
        isLoading,
        isRefetch,
        isIncomingRefetch,
        isOutgoingRefetch,
        isSolicitedRefetch,
        setIsLoading,
        setIsRefetch,
        setIsIncomingRefetch,
        setIsOutgoingRefetch,
        setIsSolicitedRefetch
      }}
    >
      <ConsentsProvider>
        {children}
        <ReasonModal />
      </ConsentsProvider>
    </AccountConsentContext.Provider>
  )
}

const useUserConsents = (): AccountConsentsProviderValue =>
  useContext(AccountConsentContext)

export { AccountConsentContext, AccountConsentsProvider, useUserConsents }
export default AccountConsentsProvider
