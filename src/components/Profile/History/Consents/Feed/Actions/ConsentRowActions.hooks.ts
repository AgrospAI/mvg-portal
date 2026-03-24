import { createContext, useContext } from 'react'

interface ConsentRowActionsValue {
  request: MetadataRequest
  renderMode: 'menu' | 'modals'
}

export const ConsentRowActionsContext =
  createContext<ConsentRowActionsValue | null>(null)

export const useConsentRowActions = () => {
  const context = useContext(ConsentRowActionsContext)
  if (!context) {
    throw new Error(
      'ConsentRowActions components must be used inside ConsentRowActions'
    )
  }
  return context
}
