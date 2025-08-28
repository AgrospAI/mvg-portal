import Page from '@components/@shared/Page'
import { VerifiableCredentials } from '@components/VerifiableCredentials'
import { useAddressConfig } from '@hooks/useAddressConfig'
import { useVerifiableCredentials } from '@hooks/useVerifiableCredentials'
import { useRouter } from 'next/router'
import { Address, useAccount } from 'wagmi'

function CredentialsPage() {
  const router = useRouter()
  const { address: visitorAccount } = useAccount()

  const address = (router.asPath.split('/')[2] as Address) ?? visitorAccount
  const credentials = useVerifiableCredentials(address)

  const addressConfig = useAddressConfig()
  const name = addressConfig.getVerifiedAddressName(address)

  return (
    <Page uri={router.asPath} title={`${name} - Verifiable Credentials`}>
      <VerifiableCredentials
        credentials={credentials.data.map(({ credentialUrl }) => credentialUrl)}
      />
    </Page>
  )
}

export default CredentialsPage
