import { useCurrentConsent } from '@hooks/useCurrentConsent'
import { useListConsent } from '@hooks/useListConsent'
import { isIncoming, isPending } from '@utils/consents/utils'
import { useAccount } from 'wagmi'
import ConsentResponse from '../Components/ConsentResponse'
import DetailedAsset from '../Components/DetailedAsset'
import Reason from '../Components/Reason'
import { FullRequests } from '../Components/Requests'
import Sections from '../Components/Sections'
import Solicitor from '../Components/Solicitor'
import styles from './index.module.css'

function InspectConsentsModal() {
  const { address } = useAccount()
  const { currentConsent: consent } = useCurrentConsent()

  const {
    datasetQuery: { data: dataset },
    algorithmQuery: { data: algorithm }
  } = useListConsent(consent)

  const isOwner = dataset.nft.owner === address
  const isInteractive = isOwner && isPending(consent)
  const isShowResponse = !isPending(consent) || isOwner

  const renderResponse = isShowResponse && (
    <ConsentResponse>
      {isInteractive ? (
        <ConsentResponse.InteractiveResponseForm
          consent={consent}
          dataset={dataset}
          algorithm={algorithm}
        />
      ) : (
        <>
          <Reason text={'Dataset owner response'}>
            {consent.response?.reason}
          </Reason>
          {consent.response &&
          Object.values(consent.response?.permitted).some((value) => value) ? (
            <ConsentResponse.ResponsePermissions
              permitted={consent.response?.permitted}
              dataset={dataset}
              algorithm={algorithm}
            >
              Grants permission to:
            </ConsentResponse.ResponsePermissions>
          ) : (
            <> </>
          )}
        </>
      )}
    </ConsentResponse>
  )

  return (
    <Sections>
      <Sections.Section>
        <Sections.SectionTitle>Assets</Sections.SectionTitle>
        <DetailedAsset>
          <DetailedAsset.Title>
            {isIncoming(consent) ? <>Your dataset</> : <>Their dataset</>}
          </DetailedAsset.Title>
          <DetailedAsset.AssetInfo asset={dataset} />
        </DetailedAsset>
        <hr className={styles.separator} />
        <DetailedAsset>
          <DetailedAsset.Title>Requesting algorithm</DetailedAsset.Title>
          <DetailedAsset.AssetInfo asset={algorithm} />
        </DetailedAsset>
      </Sections.Section>
      <Sections.Section>
        <Sections.SectionTitle>Requests</Sections.SectionTitle>
        <Solicitor
          address={consent.solicitor.address}
          createdAt={consent.created_at}
        />
        <Reason>{consent.reason}</Reason>
        <FullRequests
          requests={consent.request}
          dataset={dataset}
          algorithm={algorithm}
        >
          <span>Requests for:</span>
        </FullRequests>
      </Sections.Section>
      {isShowResponse && (
        <Sections.Section>
          <Sections.SectionTitle>
            <span className={styles.row}>
              Response{' '}
              {!isInteractive && (
                <ConsentResponse.Status status={consent.status} />
              )}
            </span>
          </Sections.SectionTitle>
          {renderResponse}
        </Sections.Section>
      )}
    </Sections>
  )
}

export default InspectConsentsModal
