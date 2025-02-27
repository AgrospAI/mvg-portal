import { LoggerInstance } from '@oceanprotocol/lib'
import {
  getUserIncomingConsents,
  getUserOutgoingConsents,
  updateConsent,
  ConsentState
} from '@utils/consentsUser'
import React, {
  createContext,
  PropsWithChildren,
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
  isLoading: boolean
  isInspect: boolean
  isOnlyPending: boolean
  setSelected: (consent: Consent) => void
  setIsInspect: (value: boolean) => void
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

  const [isInspect, setIsInspect] = useState(false)
  const [isOnlyPending, setIsOnlyPending] = useState(false)

  const [incoming, setIncoming] = useState<Consent[]>([])
  const [outgoing, setOutgoing] = useState<Consent[]>([])
  const [selected, setSelected] = useState<Consent>()

  const fetchUserConsents = async (way: 'incoming' | 'outgoing') => {
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
  }

  const updatSelectedState = async (state: ConsentState) => {
    if (!selected) return

    const { state: newState } = await updateConsent(selected.id, state)

    setSelected((prev) => ({ ...prev, state: newState }))
    // Also update it in the cache
    if (selected.owner === address) {
      setIncoming(
        incoming.map((consent) =>
          consent.id === selected.id ? { ...consent, state: newState } : consent
        )
      )
    } else {
      setOutgoing(
        outgoing.map((consent) =>
          consent.id === selected.id ? { ...consent, state: newState } : consent
        )
      )
    }
  }

  useEffect(() => {
    fetchUserConsents('incoming')
  }, [address, incomingPending])

  useEffect(() => {
    fetchUserConsents('outgoing')
  }, [address, outgoingPending])

  return (
    <ConsentsProviderContext.Provider
      value={{
        incoming: isOnlyPending ? filterPending(incoming) : incoming,
        outgoing: isOnlyPending ? filterPending(outgoing) : outgoing,
        selected,
        isLoading,
        isInspect,
        isOnlyPending,
        setSelected,
        setIsInspect,
        setIsOnlyPending,
        updateSelected: updatSelectedState
      }}
    >
      {children}
    </ConsentsProviderContext.Provider>
  )
}

const useConsents = (): ConsentsProviderValue =>
  useContext(ConsentsProviderContext)

export { useConsents, ConsentsProvider, ConsentsProviderContext }
export default ConsentsProvider
