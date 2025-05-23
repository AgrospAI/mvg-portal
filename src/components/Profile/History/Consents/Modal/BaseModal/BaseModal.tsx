import Modal from '@components/@shared/atoms/Modal'
import { useModal } from '@context/Modal'
import { createContext, ReactNode, useContext } from 'react'
import BaseModalActions from './Sections/BaseModalActions'
import BaseModalAsset from './Sections/BaseModalAsset'
import BaseModalAssetPicker from './Sections/BaseModalAssetPicker'
import BaseModalInteractiveRequest from './Sections/BaseModalInteractiveRequest'
import BaseModalInteractiveResponse from './Sections/BaseModalInteractiveResponse'
import BaseModalRequest from './Sections/BaseModalRequest'
import BaseModalResponse from './Sections/BaseModalResponse'
import BaseModalSection from './Sections/BaseModalSection'
import BaseModalSeparator from './Sections/BaseModalSeparator'
import BaseModalStatus from './Sections/BaseModalStatus'

interface BaseModalContextValue {}

const BaseModalContext = createContext({} as BaseModalContextValue)

interface BaseModalProps {
  title: string
  onToggle?: () => void
  children: ReactNode
}

function BaseModal({ title, onToggle, children }: BaseModalProps) {
  const { isShown, closeModal } = useModal()

  return (
    <BaseModalContext.Provider value={{}}>
      <Modal
        title={title}
        onToggleModal={() => {
          closeModal()
          onToggle && onToggle()
        }}
        isOpen={isShown}
      >
        {children}
      </Modal>
    </BaseModalContext.Provider>
  )
}

export const useBaseModal = () => {
  const context = useContext(BaseModalContext)
  if (!context) {
    throw new Error('BaseModal components must be used inside BaseModal')
  }
  return context
}

BaseModal.Section = BaseModalSection
BaseModal.Asset = BaseModalAsset
BaseModal.Request = BaseModalRequest
BaseModal.InteractiveResponse = BaseModalInteractiveResponse
BaseModal.Separator = BaseModalSeparator
BaseModal.Actions = BaseModalActions
BaseModal.Response = BaseModalResponse
BaseModal.Status = BaseModalStatus
BaseModal.AssetPicker = BaseModalAssetPicker
BaseModal.InteractiveRequest = BaseModalInteractiveRequest

export default BaseModal
