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
  isLoading: boolean
  isRefetch: boolean
  setIsLoading: (value: boolean) => void
  setIsRefetch: (value: boolean) => void
}

const refreshInterval = 20000

const AccountConsentContext = createContext({} as AccountConsentsProviderValue)

function AccountConsentsProvider({ children }) {
  const { address } = useAccount()

  const [incomingPending, setIncomingPending] = useState(0)
  const [outgoingPending, setOutgoingPending] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isRefetch, setIsRefetch] = useState(false)

  // Periodic fetching of user consents amount
  const fetchUserConsentsAmount = useCallback(
    async (type: string) => {
      if (!address) return

      type === 'init' && setIsLoading(true)

      getUserConsentsAmount(address)
        .then((data) => {
          setIncomingPending(data.incoming_pending_consents)
          setOutgoingPending(data.outgoing_pending_consents)
        })
        .catch((error) => LoggerInstance.error(error.message))
        .finally(() => setIsLoading(false))
    },
    [address]
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
        isLoading,
        isRefetch,
        setIsLoading,
        setIsRefetch
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
