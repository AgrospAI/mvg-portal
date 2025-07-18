import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState
} from 'react'
import QueryBoundary from '../QueryBoundary'
import Modal from '../atoms/Modal'

interface ModalContextValue {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const ModalContext = createContext({} as ModalContextValue)

const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) throw new Error('Modal components must be used inside Modal')
  return context
}

function ModalProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

function ModalContent({
  title,
  children
}: PropsWithChildren<{
  title?: string
}>) {
  const { isOpen, closeModal } = useModalContext()

  if (!isOpen) return null

  return (
    <Modal title={title} onToggleModal={closeModal} isOpen={isOpen}>
      <QueryBoundary>{children}</QueryBoundary>
    </Modal>
  )
}

function ModalTrigger({ children }: PropsWithChildren) {
  const { openModal } = useModalContext()
  return <span onClick={openModal}>{children}</span>
}

function _Modal({ children }: PropsWithChildren) {
  return <ModalProvider>{children}</ModalProvider>
}

_Modal.Trigger = ModalTrigger
_Modal.Content = ModalContent

export default _Modal
export { useModalContext }
