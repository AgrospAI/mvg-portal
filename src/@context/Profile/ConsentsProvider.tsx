import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import ReasonModal from './ReasonModal'
import { useAccount } from 'wagmi'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getConsentsUser } from '@utils/consentsUser'
import { useCancelToken } from '@hooks/useCancelToken'

export interface ConsentsProviderValue {
  incomingPendingConsents: number
  outgoingPendingConsents: number
  setSelectedConsent: (consent: Consent) => void
}

interface Props {
  address: string
}

const refreshInterval = 20000

const ConsentContext = createContext({} as ConsentsProviderValue)

function AccountConsentsProvider({
  children,
  address
}: PropsWithChildren<Props>) {
  const { address: public_key } = useAccount()

  const [hasReasonInspect, setHasReasonInspect] = useState(false)
  const [incomingPendingConsents, setIncomingPendingConsents] = useState(0)
  const [outgoingPendingConsents, setOutgoingPendingConsents] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const newCancelToken = useCancelToken()

  const fetchUserConsents = useCallback(
    async (type: string) => {
      if (!public_key) {
        return
      }

      try {
        type === 'init' && setIsLoading(true)
        const userConsentsData = await getConsentsUser(public_key)

        setIncomingPendingConsents(userConsentsData.incoming_consents)
        setOutgoingPendingConsents(userConsentsData.outgoing_consents)

        setIsLoading(false)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoading(false)
      }
    },
    [public_key, newCancelToken]
  )

  useEffect(() => {
    fetchUserConsents('init')

    // init periodic refresh for consents
    const balanceInterval = setInterval(
      () => fetchUserConsents('repeat'),
      refreshInterval
    )

    return () => {
      clearInterval(balanceInterval)
    }
  }, [public_key])

  const acceptConsent = async () => {}
  const rejectConsent = async () => {}

  return (
    <ConsentContext.Provider
      value={{
        incomingPendingConsents,
        outgoingPendingConsents,
        setSelectedConsent
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
    </ConsentContext.Provider>
  )
}

const useConsents = (): ConsentsProviderValue => useContext(ConsentContext)

export {
  ConsentContext,
  AccountConsentsProvider as ConsentsProvider,
  useConsents
}
export default AccountConsentsProvider
