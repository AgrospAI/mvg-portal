import { updateQueryParameters } from '@utils/searchParams'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext
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
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get('isOpen') === 'true' || false

  const openModal = useCallback(
    () => updateQueryParameters(router, 'isOpen', true),
    [router]
  )
  const closeModal = useCallback(
    () => updateQueryParameters(router, 'isOpen', null),
    [router]
  )

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

function ModalTrigger({
  onClick,
  children
}: PropsWithChildren<{ onClick?: () => void }>) {
  const { openModal } = useModalContext()
  return (
    <span
      onClick={() => {
        openModal()
        onClick && onClick()
      }}
    >
      {children}
    </span>
  )
}

function _Modal({ children }: PropsWithChildren) {
  return <ModalProvider>{children}</ModalProvider>
}

_Modal.Trigger = ModalTrigger
_Modal.Content = ModalContent

export default _Modal
export { useModalContext }
