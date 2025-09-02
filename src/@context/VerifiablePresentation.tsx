import { useVerifiableCredentials } from '@hooks/useVerifiableCredentials'
import { useVerifiablePresentations } from '@hooks/useVerifiablePresentations'
import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { type ReactNode, createContext, useContext } from 'react'
import { Address } from 'wagmi'

interface VerifiablePresentationContextProps {
  credentials: PontusVerifiableCredentialArray
  verifiablePresentations: Awaited<
    ReturnType<typeof useVerifiablePresentations>
  >
}

const VerifiablePresentationContext = createContext(
  {} as VerifiablePresentationContextProps
)

interface VerifiablePresentationProps {
  address: Address
  children?: ReactNode
}

const VerifiablePresentationProvider = ({
  address,
  children
}: Readonly<VerifiablePresentationProps>) => {
  const { data: credentials } = useVerifiableCredentials(address)
  const verifiablePresentations = useVerifiablePresentations(credentials)

  return (
    <VerifiablePresentationContext.Provider
      value={{
        credentials,
        verifiablePresentations
      }}
    >
      {children}
    </VerifiablePresentationContext.Provider>
  )
}

const useVerifiablePresentationContext = () => {
  const ctx = useContext(VerifiablePresentationContext)
  if (!ctx)
    throw new Error(
      'useVerifiablePresentationContext used outside of VerifiablePresentationContext'
    )
  return ctx
}

export default VerifiablePresentationProvider
export { useVerifiablePresentationContext }
