import { createContext, PropsWithChildren, useContext, useState } from 'react'
import ConsentPetitionModal from './ConsentPetitionModal'

interface ConsentsPetitionProviderValue {
  isStartPetition: boolean
  setIsStartPetition: (value: boolean) => void
}

const ConsentsPetition = createContext({} as ConsentsPetitionProviderValue)

const ConsentsPetitionProvider = ({ children }: PropsWithChildren) => {
  const [isStartPetition, setIsStartPetition] = useState(false)

  return (
    <ConsentsPetition.Provider
      value={{
        isStartPetition,
        setIsStartPetition
      }}
    >
      {children}
      <ConsentPetitionModal />
    </ConsentsPetition.Provider>
  )
}

const useConsentsPetition = (): ConsentsPetitionProviderValue =>
  useContext(ConsentsPetition)

export { ConsentsPetition, ConsentsPetitionProvider, useConsentsPetition }
export default ConsentsPetitionProvider
