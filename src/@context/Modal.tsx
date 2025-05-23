import { Consent } from '@utils/consents/types'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState
} from 'react'

interface ModalValue {
  openModal: () => void
  closeModal: () => void
  isShown: boolean
  isInteractive: boolean
  selected: Consent | undefined
  setSelected: (consent: any | undefined) => void
  setIsInteractive: (value: boolean) => void
  setCurrentModal: (modal: ReactNode) => void
}

const ModalContext = createContext({} as ModalValue)

interface ModalProviderProps {
  isStartShown?: boolean
  children: ReactNode
}

export default function ModalProvider({
  isStartShown,
  children
}: ModalProviderProps) {
  const [isShown, setIsShown] = useState(isStartShown || false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [currentModal, setCurrentModal] = useState<ReactNode | undefined>()
  const [selected, setSelected] = useState<any>()

  const openModal = useCallback(() => {
    setIsShown(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsShown(false)
    setIsInteractive(false)
    setCurrentModal(undefined)
    setSelected(undefined)
  }, [])

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        isShown,
        setCurrentModal,
        isInteractive,
        setIsInteractive,
        selected,
        setSelected
      }}
    >
      {isShown && currentModal}
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
