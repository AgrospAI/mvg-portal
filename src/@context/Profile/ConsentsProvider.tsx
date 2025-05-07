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
  setIncoming: (consents: ListConsent[]) => void
  setSelected: (consent: ListConsent) => void
  setIsInspect: (value: boolean) => void
  setIsInteractiveInspect: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  setIsOnlyPending: (value: boolean) => void
}

const ConsentsProviderContext = createContext({} as ConsentsProviderValue)

function ConsentsProvider({ children }: PropsWithChildren) {
  const { address } = useAccount()
  const {
    isLoading,
    setIsLoading,
    isRefetch,
    setIsRefetch,
    isOutgoingRefetch,
    setIsOutgoingRefetch,
    isIncomingRefetch,
    setIsIncomingRefetch,
    isSolicitedRefetch,
    setIsSolicitedRefetch
  } = useUserConsents()

  const [isOnlyPending, setIsOnlyPending] = useState(false)
  const [isInspect, setIsInspect] = useState(false)
  const [isInteractiveInspect, setIsInteractiveInspect] = useState(false)

  const [incoming, setIncoming] = useState<ListConsent[]>([])
  const [outgoing, setOutgoing] = useState<ListConsent[]>([])
  const [solicited, setSolicited] = useState<ListConsent[]>([])
  const [selected, setSelected] = useState<ListConsent>()

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

  useEffect(() => {
    if (isIncomingRefetch || isRefetch) {
      fetchUserConsents(ConsentDirection.INCOMING)
      setIsIncomingRefetch(false)
      setIsRefetch(false)
    }
  }, [
    address,
    fetchUserConsents,
    isIncomingRefetch,
    isRefetch,
    setIsIncomingRefetch,
    setIsRefetch
  ])

  useEffect(() => {
    if (isOutgoingRefetch || isRefetch) {
      fetchUserConsents(ConsentDirection.OUTGOING)
      setIsOutgoingRefetch(false)
      setIsRefetch(false)
    }
  }, [
    address,
    fetchUserConsents,
    isOutgoingRefetch,
    isRefetch,
    setIsOutgoingRefetch,
    setIsRefetch
  ])

  useEffect(() => {
    if (isSolicitedRefetch || isRefetch) {
      fetchUserConsents(ConsentDirection.SOLICITED)
      setIsSolicitedRefetch(false)
      setIsRefetch(false)
    }
  }, [
    address,
    fetchUserConsents,
    isRefetch,
    isSolicitedRefetch,
    setIsRefetch,
    setIsSolicitedRefetch
  ])

  const isPending = (consent: ListConsent) => {
    return consent.status == null || consent.status === ConsentState.PENDING
  }

  const filtered = (consents: ListConsent[]) => {
    if (!isOnlyPending) return consents
    return consents.filter(isPending)
  }

  return (
    <ConsentsProviderContext.Provider
      value={{
        incoming: filtered(incoming),
        outgoing: filtered(outgoing),
        solicited: filtered(solicited),
        selected,
        isInspect,
        isInteractiveInspect,
        isLoading,
        isOnlyPending,
        setIncoming,
        setSelected,
        setIsInspect,
        setIsInteractiveInspect,
        setIsLoading,
        setIsOnlyPending
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
