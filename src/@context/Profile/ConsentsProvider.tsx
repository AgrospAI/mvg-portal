import { LoggerInstance } from '@oceanprotocol/lib'
import {
  ConsentState,
  getUserIncomingConsents,
  getUserOutgoingConsents,
  updateConsent
} from '@utils/consentsUser'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount } from 'wagmi'
import { useUserConsents } from './AccountConsentsProvider'

interface ConsentsProviderValue {
  incoming: Consent[]
  outgoing: Consent[]
  selected?: Consent
  isInspect: boolean
  isLoading: boolean
  isOnlyPending: boolean
  setSelected: (consent: Consent) => void
  setIsInspect: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setIsOnlyPending: (value: boolean) => void
  updateSelected: (state: ConsentState) => void
}

const ConsentsProviderContext = createContext({} as ConsentsProviderValue)

const filterState = (consents: Consent[], state: ConsentState) =>
  consents.filter((consent) => consent.state === state)

const filterPending = (consents: Consent[]) =>
  filterState(consents, ConsentState.PENDING)

function ConsentsProvider({ children }: PropsWithChildren) {
  const { address } = useAccount()
  const { incomingPending, outgoingPending, isLoading, setIsLoading } =
    useUserConsents()

  const [isOnlyPending, setIsOnlyPending] = useState(false)
  const [isInspect, setIsInspect] = useState(false)

  const [incoming, setIncoming] = useState<Consent[]>([])
  const [outgoing, setOutgoing] = useState<Consent[]>([])
  const [selected, setSelected] = useState<Consent>()

  const fetchUserConsents = useCallback(
    async (way: 'incoming' | 'outgoing') => {
      if (!address) return

      setIsLoading(true)

      if (way === 'incoming') {
        getUserIncomingConsents(address)
          .then((data) => {
            setIncoming(data)
          })
          .catch((error) => LoggerInstance.error(error.message))
          .finally(() => setIsLoading(false))
      } else {
        getUserOutgoingConsents(address)
          .then((data) => {
            setOutgoing(data)
          })
          .catch((error) => LoggerInstance.error(error.message))
          .finally(() => setIsLoading(false))
      }
    },
    [address, setIsLoading]
  )

  const updateSelected = async (state: ConsentState) => {
    if (!selected) return

    setIsLoading(true)

    updateConsent(selected.id, state)
      .then(({ state }) => {
        setIncoming(
          incoming.map((consent) =>
            consent.id === selected.id ? { ...consent, state } : consent
          )
        )
      })
      .catch((error) => LoggerInstance.error(error.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchUserConsents('incoming')
  }, [address, incomingPending, fetchUserConsents])

  useEffect(() => {
    fetchUserConsents('outgoing')
  }, [address, outgoingPending, fetchUserConsents])

  return (
    <ConsentsProviderContext.Provider
      value={{
        incoming: isOnlyPending ? filterPending(incoming) : incoming,
        outgoing: isOnlyPending ? filterPending(outgoing) : outgoing,
        selected,
        isInspect,
        isLoading,
        isOnlyPending,
        setSelected,
        setIsInspect,
        setIsLoading,
        setIsOnlyPending,
        updateSelected
      }}
    >
      {children}
    </ConsentsProviderContext.Provider>
  )
}

const useConsents = (): ConsentsProviderValue =>
  useContext(ConsentsProviderContext)

export { ConsentsProvider, ConsentsProviderContext, useConsents }
export default ConsentsProvider
