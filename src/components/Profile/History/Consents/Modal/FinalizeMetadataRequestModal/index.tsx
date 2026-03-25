import Alert from '@components/@shared/atoms/Alert'
import { useModalContext } from '@components/@shared/Modal'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { getAssetQueryOptions } from '@hooks/useMetadataRequests'
import { useFinalizeMetadataRequest } from '@hooks/useUserMetadataRequests'
import IconCompute from '@images/compute.svg'
import IconLock from '@images/lock.svg'
import { useSuspenseQueries } from '@tanstack/react-query'
import { isFinished, isPending } from '@utils/consents/utils'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import Actions from '../Components/Actions'
import ConsentResponse from '../Components/ConsentResponse'
import DetailedAsset from '../Components/DetailedAsset'
import Sections from '../Components/Sections'
import styles from './index.module.css'

interface Props {
  request: ExtendedMetadataRequest
}

export const FinalizeMetadataRequestModal = ({ request }: Readonly<Props>) => {
  const { closeModal } = useModalContext()
  const { finalizeMetadataRequest } = useFinalizeMetadataRequest()
  const { refreshRequests } = useMetadataRequests()
  const [{ data: dataset }, { data: algorithm }] = useSuspenseQueries({
    queries: [
      getAssetQueryOptions(request.dataset.did),
      getAssetQueryOptions(request.algorithm.did)
    ]
  })

  const successCallback = useCallback(() => {
    closeModal()
    refreshRequests()
    toast.success('Succesfully applied metadata request')
  }, [closeModal, refreshRequests])

  const callback = useCallback(() => {
    finalizeMetadataRequest({ requestId: request.id })
      .then(successCallback)
      .catch(() =>
        toast.error(
          "Could not apply changes, maybe the request hasn't expired yet?"
        )
      )
  }, [finalizeMetadataRequest, request.id, successCallback])

  const isInPendingState = isPending(request)
  const isAlreadyExpired = isFinished(request)
  const canRespond = isInPendingState && !isAlreadyExpired

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
      <Sections.Section
        title="Response"
        icon={<IconLock />}
        description={<ConsentResponse.Status status={request.status} />}
      >
        <Sections.Column className={styles.customGap}>
          <ConsentResponse>
            <ConsentResponse.ResponsePermissions
              requestId={request.id}
              dataset={dataset}
              algorithm={algorithm}
            >
              Resolution:
            </ConsentResponse.ResponsePermissions>
          </ConsentResponse>
        </Sections.Column>
      </Sections.Section>

      {!isInPendingState && (
        <Alert text="This request has already been applied to" state="info" />
      )}

      {!isAlreadyExpired && (
        <Alert
          text="You can not apply the change before the request expires"
          state="info"
        />
      )}

      <Actions
        acceptText="Apply Changes"
        rejectText="Cancel"
        handleReject={closeModal}
        handleAccept={callback}
        isLoading={canRespond}
      />
    </Sections>
  )
}
