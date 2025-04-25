import { LoggerInstance } from '@oceanprotocol/lib'
import {
  ConsentState,
  getUserIncomingConsents,
  getUserOutgoingConsents
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
  incoming: ListConsent[]
  outgoing: ListConsent[]
  selected: ListConsent | undefined
  isInspect: boolean
  isInteractiveInspect: boolean
  isLoading: boolean
  isOnlyPending: boolean
  setSelected: (consent: ListConsent) => void
  setIsInspect: (value: boolean) => void
  setIsInteractiveInspect: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setIsOnlyPending: (value: boolean) => void
  updateSelected: (state: ConsentState) => void
}

const ConsentsProviderContext = createContext({} as ConsentsProviderValue)

function ConsentsProvider({ children }: PropsWithChildren) {
  const { address } = useAccount()
  const { incomingPending, outgoingPending, isLoading, setIsLoading } =
    useUserConsents()

  const [isOnlyPending, setIsOnlyPending] = useState(false)
  const [isInspect, setIsInspect] = useState(false)
  const [isInteractiveInspect, setIsInteractiveInspect] = useState(false)

  const [incoming, setIncoming] = useState<ListConsent[]>([])
  const [outgoing, setOutgoing] = useState<ListConsent[]>([])
  const [selected, setSelected] = useState<ListConsent>()

  const fetchUserConsents = useCallback(
    async (way: 'incoming' | 'outgoing') => {
      if (!address) return

      setIsLoading(true)

      const setIfOk = (
        fetcher: () => Promise<ListConsent[]>,
        setter: (data: ListConsent[]) => void
      ) => {
        fetcher()
          .then(setter)
          .catch((error) => LoggerInstance.error(error.message))
      }

      switch (way) {
        case 'incoming':
          setIfOk(() => getUserIncomingConsents(address), setIncoming)
          break
        case 'outgoing':
          setIfOk(() => getUserOutgoingConsents(address), setOutgoing)
          break
      }

      setIsLoading(false)
    },
    [address, setIsLoading]
  )

  const updateSelected = (state: ConsentState) => {}

  useEffect(() => {
    fetchUserConsents('incoming')
  }, [address, incomingPending, fetchUserConsents])

  useEffect(() => {
    fetchUserConsents('outgoing')
  }, [address, outgoingPending, fetchUserConsents])

  return (
    <ConsentsProviderContext.Provider
      value={{
        incoming,
        outgoing,
        selected,
        isInspect,
        isInteractiveInspect,
        isLoading,
        isOnlyPending,
        setSelected,
        setIsInspect,
        setIsInteractiveInspect,
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
