import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useCreateAssetConsent, useHealthcheck } from '@hooks/useUserConsents'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { Suspense, useCallback, useState } from 'react'
import AssetInput from './Components/AssetInput'
import RequestsList from './Components/RequestsList'
import Sections from './Components/Sections'

interface Props {
  asset: Asset
}

function ConsentPetitionModal({ asset }: Props) {
  useHealthcheck()
  const { closeModal } = useModalContext()
  const { mutateAsync: createConsent } = useCreateAssetConsent()
  const [selected, setSelected] = useState<Asset>()

  const handleSubmit = useCallback(
    (reason: string, request: PossibleRequests) => {
      const consent = {
        datasetDid: asset.id,
        algorithmDid: selected.id,
        request,
        reason
      }

      createConsent(consent, {
        onSuccess: closeModal
      })
    },
    [asset.id, closeModal, createConsent, selected?.id]
  )

  return (
    <Suspense fallback={<Loader />}>
      <Sections>
        <Sections.Section>
          <Sections.SectionTitle>1. Algorithm</Sections.SectionTitle>
          <AssetInput
            asset={asset}
            selected={selected}
            setSelected={setSelected}
          />
        </Sections.Section>
        {selected && (
          <Sections.Section>
            <Sections.SectionTitle>2. Requests</Sections.SectionTitle>
            <RequestsList
              dataset={asset}
              algorithm={selected}
              handleSubmit={handleSubmit}
            />
          </Sections.Section>
        )}
      </Sections>
    </Suspense>
  )
}

export default ConsentPetitionModal
