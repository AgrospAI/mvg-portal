import { LoggerInstance } from '@oceanprotocol/lib'
import {
  ConsentDirection,
  ConsentState,
  getUserConsents,
  ListConsent
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
  solicited: ListConsent[]
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
  refetchIncoming: () => void
  refetchOutgoing: () => void
  refetchSolicited: () => void
}

const ConsentsProviderContext = createContext({} as ConsentsProviderValue)

function ConsentsProvider({ children }: PropsWithChildren) {
  const { address } = useAccount()
  const {
    incomingPending,
    outgoingPending,
    solicitedPending,
    isLoading,
    setIsLoading
  } = useUserConsents()

  const [isOnlyPending, setIsOnlyPending] = useState(false)
  const [isInspect, setIsInspect] = useState(false)
  const [isInteractiveInspect, setIsInteractiveInspect] = useState(false)

  const [incoming, setIncoming] = useState<ListConsent[]>([])
  const [outgoing, setOutgoing] = useState<ListConsent[]>([])
  const [solicited, setSolicited] = useState<ListConsent[]>([])
  const [selected, setSelected] = useState<ListConsent>()

  const [refetchIncoming, setRefetchIncoming] = useState(true)
  const [refetchOutgoing, setRefetchOutgoing] = useState(true)
  const [refetchSolicited, setRefetchSolicited] = useState(true)

  const fetchUserConsents = useCallback(
    async (direction: ConsentDirection) => {
      if (!address) return

      setIsLoading(true)

      let setter = setIncoming

      switch (direction) {
        case ConsentDirection.SOLICITED:
          setter = setSolicited
          break
        case ConsentDirection.OUTGOING:
          setter = setOutgoing
          break
      }

      getUserConsents(address, direction)
        .then(setter)
        .catch((error) => LoggerInstance.error(error.message))

      setIsLoading(false)
    },
    [address, setIsLoading]
  )

  const updateSelected = (state: ConsentState) => {}

  useEffect(() => {
    if (refetchIncoming) {
      fetchUserConsents(ConsentDirection.INCOMING)
      setRefetchIncoming(false)
    }
  }, [address, solicitedPending, fetchUserConsents, refetchIncoming])

  useEffect(() => {
    if (refetchOutgoing) {
      fetchUserConsents(ConsentDirection.OUTGOING)
      setRefetchOutgoing(false)
    }
  }, [address, incomingPending, fetchUserConsents, refetchOutgoing])

  useEffect(() => {
    if (refetchSolicited) {
      fetchUserConsents(ConsentDirection.SOLICITED)
      setRefetchSolicited(false)
    }
  }, [address, outgoingPending, fetchUserConsents, refetchSolicited])

  return (
    <ConsentsProviderContext.Provider
      value={{
        incoming,
        outgoing,
        solicited,
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
        updateSelected,
        refetchIncoming: () => setRefetchIncoming(true),
        refetchOutgoing: () => setRefetchOutgoing(true),
        refetchSolicited: () => setRefetchSolicited(true)
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
