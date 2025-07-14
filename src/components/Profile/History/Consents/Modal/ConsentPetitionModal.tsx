import { useModal } from '@context/Modal'
import { useCreateAssetConsent } from '@hooks/useUserConsents'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import BaseModal from './BaseModal/BaseModal'

interface ConsentPetitionModalProps {
  asset: Asset
}

export default function ConsentPetitionModal({
  asset
}: ConsentPetitionModalProps) {
  const { address } = useAccount()
  const { closeModal } = useModal()
  const { mutateAsync: createConsent } = useCreateAssetConsent()
  const [selected, setSelected] = useState<Asset>()

  return (
    <BaseModal title="Make petition">
      <BaseModal.Section title="1. Algorithm">
        <BaseModal.AssetPicker
          address={address}
          asset={asset}
          selected={selected}
          setSelected={setSelected}
        />
      </BaseModal.Section>
      {selected && (
        <BaseModal.Section title="2. Requests">
          <BaseModal.InteractiveRequest
            algorithm={selected}
            dataset={asset}
            handleSubmit={(reason: string, request: PossibleRequests) => {
              createConsent(
                {
                  datasetDid: asset.id,
                  algorithmDid: selected.id,
                  request,
                  reason
                },
                {
                  onSuccess: closeModal
                }
              )
            }}
          />
        </BaseModal.Section>
      )}
    </BaseModal>
  )
}
