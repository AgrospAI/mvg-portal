import ConsentPetitionModal from '@components/Profile/History/Consents/Modal/ConsentPetitionModal'
import { createContext, PropsWithChildren, useContext, useState } from 'react'

interface ConsentsPetitionProviderValue {
  isStartPetition: boolean
  setIsStartPetition: (value: boolean) => void
  dataset: AssetExtended
  setDataset: (value: AssetExtended) => void
}

const ConsentsPetition = createContext({} as ConsentsPetitionProviderValue)

const ConsentsPetitionProvider = ({ children }: PropsWithChildren) => {
  const [isStartPetition, setIsStartPetition] = useState(false)
  const [dataset, setDataset] = useState<AssetExtended | undefined>()

  return (
    <ConsentsPetition.Provider
      value={{
        isStartPetition,
        setIsStartPetition,
        dataset,
        setDataset
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
