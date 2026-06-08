import Alert from '@components/@shared/atoms/Alert'
import { useModalContext } from '@components/@shared/Modal'
import { useMetadataRequests } from '@context/UserMetadataRequests'
import { getAssetQueryOptions } from '@hooks/useMetadataRequests'
import {
  useApplyMetadataRequest,
  useFinalizeMetadataRequest
} from '@hooks/useUserMetadataRequests'
import IconCompute from '@images/compute.svg'
import IconLock from '@images/lock.svg'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useSuspenseQueries } from '@tanstack/react-query'
import { isFinished, isPending } from '@utils/consents/utils'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import Actions from '../Components/Actions'
import ConsentResponse from '../Components/ConsentResponse'
import DetailedAsset from '../Components/DetailedAsset'
import Sections from '../Components/Sections'
import styles from './index.module.css'

export const FinalizeMetadataRequestModal = ({
  request
}: Readonly<{
  request: ExtendedMetadataRequest
}>) => {
  const { closeModal } = useModalContext()
  const { finalizeMetadataRequest } = useFinalizeMetadataRequest()
  const { applyMetadataRequest } = useApplyMetadataRequest(request.id)

  const { refreshRequests } = useMetadataRequests()
  const [{ data: dataset }, { data: algorithm }] = useSuspenseQueries({
    queries: [request.dataset.did, request.algorithm.did].map(
      getAssetQueryOptions
    )
  })

  const callback = useCallback(async () => {
    try {
      await applyMetadataRequest(request)
      toast.success('Successfully applied metadata changes')
    } catch (err) {
      toast.error('Could not apply changes')
      LoggerInstance.error(err)
    }

    try {
      await finalizeMetadataRequest({ requestId: request.id })
      refreshRequests()
      toast.success('Successfully updated request state')
      closeModal()
    } catch (err) {
      toast.error(
        "Could not update state, maybe the request hasn't expired yet?"
      )
      LoggerInstance.error(err)
    }
  }, [
    applyMetadataRequest,
    closeModal,
    finalizeMetadataRequest,
    refreshRequests,
    request
  ])

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

      {isInPendingState ? (
        <Alert
          text="Upon applying changes you will be asked for two transactions: one for applying the metadata changes, and the other for updating the request status"
          state="info"
        />
      ) : (
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
