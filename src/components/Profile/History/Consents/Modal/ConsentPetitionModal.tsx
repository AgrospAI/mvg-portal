import { useModal } from '@context/Modal'
import { useCreateAssetConsent } from '@hooks/useUserConsents'
import { Asset } from '@oceanprotocol/lib'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import BaseModal from './BaseModal/BaseModal'
import { PossibleRequests } from '@utils/consents/types'

interface ConsentPetitionModalProps {
  asset: Asset
}

export default function ConsentPetitionModal({
  asset
}: ConsentPetitionModalProps) {
  const { address } = useAccount()
  const { closeModal } = useModal()
  const createConsentMutation = useCreateAssetConsent()
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
            handleSubmit={(reason: string, requests: PossibleRequests) => {
              createConsentMutation.mutate(
                {
                  dataset: asset,
                  algorithm: selected,
                  request: requests,
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
