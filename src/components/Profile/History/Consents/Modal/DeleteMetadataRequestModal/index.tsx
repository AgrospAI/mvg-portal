import { useModalContext } from '@components/@shared/Modal'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { getAssetQueryOptions } from '@hooks/useMetadataRequests'
import { useDeleteMetadataRequest } from '@hooks/useUserConsents'
import IconCompute from '@images/compute.svg'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import Actions from '../Components/Actions'
import DetailedAsset from '../Components/DetailedAsset/index'
import Sections from '../Components/Sections/index'

interface ModalProps {
  request: ExtendedMetadataRequest
}

export const DeleteMetadataRequestModal = ({
  request
}: Readonly<ModalProps>) => {
  const { closeModal } = useModalContext()
  const { refreshIncoming } = useMetadataRequests()

  const [{ data: dataset }, { data: algorithm }] = useSuspenseQueries({
    queries: [
      getAssetQueryOptions(request.dataset.did),
      getAssetQueryOptions(request.algorithm.did)
    ]
  })

  const { deleteMetadataRequest } = useDeleteMetadataRequest()

  const successCallback = useCallback(() => {
    closeModal()
    refreshIncoming()
    toast.success('Succesfully deleted request petition')
  }, [closeModal, refreshIncoming])

  const callback = useCallback(() => {
    deleteMetadataRequest({ requestId: request.id })
      .then(successCallback)
      .catch(() =>
        toast.error(
          'Did not delete consent, maybe the request has already been responded to?'
        )
      )
  }, [deleteMetadataRequest, request.id, successCallback])

  return (
    <Sections>
      <Sections.Section
        icon={<IconCompute />}
        title="Assets"
        description="Assets involved in this request, the requested dataset and the algorithm"
      >
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={dataset} />
        </DetailedAsset>
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={algorithm} />
        </DetailedAsset>
      </Sections.Section>

      <Actions
        acceptText="Cancel"
        rejectText="Delete Request"
        handleReject={callback}
        handleAccept={closeModal}
        isLoading={false}
      />
    </Sections>
  )
}
