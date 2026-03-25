import Loader from '@components/@shared/atoms/Loader'
import { useModalContext } from '@components/@shared/Modal'
import { useCreateAssetMetadataRequest } from '@hooks/useUserMetadataRequests'
import IconAlgorithm from '@images/algorithm.svg'
import IconTransaction from '@images/transaction.svg'
import { Asset, LoggerInstance } from '@oceanprotocol/lib'
import { Suspense, useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import AssetInput from '../Components/AssetInput'
import {
  MetadataRequestPetitions,
  SubmitType
} from '../Components/MetadataRequestPetitions'
import Sections from '../Components/Sections'

export const CreateMetadataRequestModal = ({
  asset
}: Readonly<{
  asset: Asset
}>) => {
  const { closeModal } = useModalContext()
  const { createAssetMetadataRequest } = useCreateAssetMetadataRequest()
  const [selected, setSelected] = useState<Asset>()

  const handleSubmit = useCallback(
    async ({ reason, permissions, expiresInSeconds }: SubmitType) => {
      await createAssetMetadataRequest({
        datasetAddress: asset.nftAddress,
        algorithmAddress: selected.nftAddress,
        reason,
        requestTypes: permissions
          .filter((r) => r.permitted)
          .map((r) => r.requestType),
        data: permissions
          .filter((r) => r.permitted)
          .map((r) => r.data ?? 'default'),
        expiresIn: Math.floor(expiresInSeconds)
      })
        .then(() => {
          toast.success('Consent petition created successfully')
          closeModal()
        })
        .catch((error) => {
          LoggerInstance.error('Error creating request', error)
          toast.error('Could not create request', error)
        })
    },
    [
      asset.nftAddress,
      selected?.nftAddress,
      closeModal,
      createAssetMetadataRequest
    ]
  )

  return (
    <Suspense fallback={<Loader />}>
      <Sections>
        <Sections.Section
          title="Algorithm"
          description="What algorithm do you want to access this asset with?"
          icon={<IconAlgorithm />}
        >
          <AssetInput asset={asset} setAlgorithm={setSelected} />
        </Sections.Section>
        {selected && (
          <Sections.Section
            title="Requests"
            description="Ask for what you need and provide a short reason"
            icon={<IconTransaction />}
          >
            <MetadataRequestPetitions
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

export default { CreateMetadataRequestModal }
