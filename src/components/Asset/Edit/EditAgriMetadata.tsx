import { transformAgriMetadata } from '@components/Publish/_utils'
import { FormAgriMetadata } from '@components/Publish/_types'
import AgriMetadataFields from '@components/Publish/AgriMetadata'
import { useAsset } from '@context/Asset'
import { useAbortController } from '@hooks/useAbortController'
import { Asset, LoggerInstance } from '@oceanprotocol/lib'
import Web3Feedback from '@shared/Web3Feedback'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { Formik, Form } from 'formik'
import { ReactElement, useEffect, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import EditFeedback from './EditFeedback'
import FormActions from './FormActions'
import content from '../../../../content/pages/editMetadata.json'

interface AgriMetadataFormValues {
  metadata: {
    agriMetadata: FormAgriMetadata
  }
}

// Keys produced by transformAgriMetadata that must be wiped before re-applying
// edited values, so that removed fields don't leave stale data behind.
const AGRI_KEYS = ['@context', 'dct:spatial', 'dct:subject', 'dct:temporal']

function reverseTransformAgriMetadata(
  storedAgriMetadata: Record<string, unknown> | undefined
): FormAgriMetadata {
  const empty: FormAgriMetadata = {
    boundingBox: { wkt: '', label: '' },
    temporalCoverage: { startDate: '', endDate: '' }
  }

  if (!storedAgriMetadata) return empty

  const spatial = storedAgriMetadata['dct:spatial'] as Record<
    string,
    unknown
  > | null
  const temporal = storedAgriMetadata['dct:temporal'] as Record<
    string,
    unknown
  > | null

  return {
    boundingBox: {
      wkt: (spatial?.['dcat:bbox'] as Record<string, string>)?.['@value'] || '',
      label: (spatial?.['skos:prefLabel'] as string) || ''
    },
    temporalCoverage: {
      startDate:
        (temporal?.['dcat:startDate'] as Record<string, string>)?.['@value'] ||
        '',
      endDate:
        (temporal?.['dcat:endDate'] as Record<string, string>)?.['@value'] || ''
    }
  }
}

export default function EditAgriMetadata({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { fetchAsset, isAssetNetwork } = useAsset()
  const { address: accountId } = useAccount()
  const { data: signer, refetch: refetchSigner } = useSigner()
  const newAbortController = useAbortController()

  const [success, setSuccess] = useState<string>()
  const [error, setError] = useState<string>()
  const hasFeedback = error || success

  const { autoWallet, isAutomationEnabled } = useAutomation()
  const [signerToUse, setSignerToUse] = useState(signer)
  const [accountIdToUse, setAccountIdToUse] = useState<string>(accountId)

  useEffect(() => {
    if (isAutomationEnabled && autoWallet?.address) {
      setAccountIdToUse(autoWallet.address)
      setSignerToUse(autoWallet)
    } else if (accountId && signer) {
      setAccountIdToUse(accountId)
      setSignerToUse(signer)
    } else {
      refetchSigner()
    }
  }, [isAutomationEnabled, signer, autoWallet, accountId])

  const additionalInfo = asset?.metadata?.additionalInformation as
    | Record<string, unknown>
    | undefined

  const initialValues: AgriMetadataFormValues = {
    metadata: {
      agriMetadata: reverseTransformAgriMetadata(additionalInfo)
    }
  }

  async function handleSubmit(
    values: AgriMetadataFormValues,
    resetForm: () => void
  ) {
    try {
      const transformed = transformAgriMetadata(values.metadata.agriMetadata)

      // Start from the existing additionalInformation minus the agri keys so
      // that cleared fields are removed, then apply the freshly transformed data.
      const baseAdditionalInfo = { ...(additionalInfo || {}) }
      AGRI_KEYS.forEach((key) => delete baseAdditionalInfo[key])

      const updatedMetadata = {
        ...asset.metadata,
        additionalInformation: {
          ...baseAdditionalInfo,
          ...(transformed || {})
        }
      }

      const updatedAsset: Asset = {
        ...(asset as Asset),
        version: '4.1.0',
        metadata: updatedMetadata
      }

      delete (updatedAsset as AssetExtended).accessDetails
      delete (updatedAsset as AssetExtended).datatokens
      delete (updatedAsset as AssetExtended).stats

      const setMetadataTx = await setNFTMetadataAndTokenURI(
        updatedAsset,
        accountIdToUse,
        signerToUse,
        decodeTokenURI(asset.nft.tokenURI),
        newAbortController()
      )

      if (!setMetadataTx) {
        setError(content.form.error)
        LoggerInstance.error(content.form.error)
        return
      }
      await setMetadataTx.wait()

      LoggerInstance.log(
        '[edit] setMetadata agriMetadata result',
        setMetadataTx
      )
      setSuccess(content.form.success)
      resetForm()
    } catch (err) {
      LoggerInstance.error((err as Error).message)
      setError((err as Error).message)
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        await handleSubmit(values, resetForm)
      }}
    >
      {({ isSubmitting }) =>
        isSubmitting || hasFeedback ? (
          <EditFeedback
            loading="Updating asset with new geographic metadata..."
            error={error}
            success={success}
            setError={setError}
            successAction={{
              name: 'Back to Asset',
              onClick: async () => {
                await fetchAsset()
              },
              to: `/asset/${asset.id}`
            }}
          />
        ) : (
          <>
            <Form>
              <AgriMetadataFields />
              <FormActions />
            </Form>

            <Web3Feedback
              networkId={asset?.chainId}
              accountId={accountIdToUse}
              isAssetNetwork={isAssetNetwork}
            />
          </>
        )
      }
    </Formik>
  )
}
