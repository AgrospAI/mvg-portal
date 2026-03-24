import Alert from '@components/@shared/atoms/Alert'
import AssetProvider from '@context/Asset'
import { useAutoSigner } from '@hooks/useAutoSigner'
import { getAssetQueryOptions } from '@hooks/useMetadataRequests'
import IconCompute from '@images/compute.svg'
import IconLock from '@images/lock.svg'
import IconTransaction from '@images/transaction.svg'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import ConsentResponse from '../Components/ConsentResponse'
import DetailedAsset from '../Components/DetailedAsset'
import Reason from '../Components/Reason'
import { FullRequests } from '../Components/Requests/FullRequests'
import Sections from '../Components/Sections'
import Solicitor from '../Components/Solicitor'
import styles from './index.module.css'

export const InspectMetadataRequestModal = ({
  request,
  isRequested
}: Readonly<{
  request: ExtendedMetadataRequest
  isRequested?: boolean
}>) => {
  const { signer } = useAutoSigner()

  const [chainId, setChainId] = useState(0)

  const [{ data: dataset }, { data: algorithm }] = useSuspenseQueries({
    queries: [
      getAssetQueryOptions(request.dataset.did),
      getAssetQueryOptions(request.algorithm.did)
    ]
  })

  useEffect(() => {
    const updateChainId = async () => {
      if (!signer) return
      setChainId(await signer.getChainId())
    }
    updateChainId()
  }, [signer])

  return (
    <Sections>
      <Sections.Section
        icon={<IconCompute />}
        title="Assets"
        description="Assets involved in this consent, your dataset and the requested algorithm"
      >
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={dataset} />
        </DetailedAsset>
        <DetailedAsset>
          <DetailedAsset.AssetInfo asset={algorithm} />
        </DetailedAsset>
      </Sections.Section>
      <Sections.Section
        icon={<IconTransaction />}
        title="Requests"
        description="Requests made by the solicitor"
      >
        <Sections.Column className={styles.customGap}>
          <Solicitor
            address={request.requester}
            createdAt={request.createdAt}
          />
          <Reason>{request.reason}</Reason>
          <FullRequests
            requestId={request.id}
            dataset={dataset}
            algorithm={algorithm}
          >
            Requests for:
          </FullRequests>
        </Sections.Column>
      </Sections.Section>
      <Sections.Section
        title="Response"
        icon={<IconLock />}
        description={
          isRequested && <ConsentResponse.Status status={request.status} />
        }
      >
        <Sections.Column className={styles.customGap}>
          <ConsentResponse>
            {isRequested ? (
              <>
                <ConsentResponse.ResponsePermissions
                  requestId={request.id}
                  dataset={dataset}
                  algorithm={algorithm}
                >
                  Resolution:
                </ConsentResponse.ResponsePermissions>
                <Alert
                  text="You will be able to apply the changes once the metadata request expires"
                  state="info"
                />
              </>
            ) : (
              <AssetProvider did={dataset.id}>
                <ConsentResponse.InteractiveResponseForm
                  chainId={chainId}
                  request={request}
                  dataset={dataset}
                  algorithm={algorithm}
                />
              </AssetProvider>
            )}
          </ConsentResponse>
        </Sections.Column>
      </Sections.Section>
    </Sections>
  )
}

export default InspectMetadataRequestModal
