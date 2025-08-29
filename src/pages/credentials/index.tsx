import Button from '@components/@shared/atoms/Button'
import Page from '@components/@shared/Page'
import { VerifiableCredentials } from '@components/VerifiableCredentials'
import { VerifiableCredentialsInfo } from '@components/VerifiableCredentials/VerifiableCredentialsInfo'
import { useAddressConfig } from '@hooks/useAddressConfig'
import { useVerifiableCredentials } from '@hooks/useVerifiableCredentials'
import { PontusVerifiableCredentialArray } from '@utils/verifiableCredentials/types'
import { isAddress } from 'ethers/lib/utils.js'
import { useRouter } from 'next/router'
import { Address, useAccount } from 'wagmi'

const getUrls = (creds: PontusVerifiableCredentialArray) =>
  creds.map(({ credentialUrl }) => credentialUrl)

function CredentialsWithAddress({ address }: { address: Address }) {
  const { data: credentials } = useVerifiableCredentials(address)
  const addressConfig = useAddressConfig()
  const name = addressConfig.getVerifiedAddressName(address)

  return (
    <Page uri={`/X/${address}`} title={`${name} - Verifiable Credentials`}>
      <VerifiableCredentials credentials={getUrls(credentials)} />
    </Page>
  )
}

const CredentialsMissingAccountAndLoggedOut = () => (
  <Page uri={`/credentials/`} title={`Verifiable Credentials`}>
    <VerifiableCredentialsInfo variant="warn">
      Did not find the specified address and not logged in.
    </VerifiableCredentialsInfo>
    <Button to="/">Go back Home</Button>
  </Page>
)

const CredentialsVisitorAccount = ({
  visitorAddress,
  isUnknown
}: {
  visitorAddress: Address
  isUnknown: boolean
}) => {
  const { data: credentials } = useVerifiableCredentials(visitorAddress)
  const addressConfig = useAddressConfig()
  const name = addressConfig.getVerifiedAddressName(visitorAddress)

  return (
    <Page
      uri={`/credentials/${visitorAddress}`}
      title={`${name} - Verifiable Credentials`}
    >
      <VerifiableCredentials credentials={getUrls(credentials)}>
        {isUnknown && (
          <VerifiableCredentialsInfo variant="info">
            The input address did not match any known address. Falling back to
            your account.
          </VerifiableCredentialsInfo>
        )}
      </VerifiableCredentials>
    </Page>
  )
}

const CredentialsWithVisitorAccount = ({
  isUnknown
}: {
  isUnknown: boolean
}) => {
  const { address: visitorAddress } = useAccount()

  if (!visitorAddress) return <CredentialsMissingAccountAndLoggedOut />

  return (
    <CredentialsVisitorAccount
      visitorAddress={visitorAddress}
      isUnknown={isUnknown}
    />
  )
}

function CredentialsPage() {
  const router = useRouter()
  const { credential } = router.query
  const cred = Array.isArray(credential) ? credential[0] : credential

  if (cred && isAddress(cred)) {
    return <CredentialsWithAddress address={cred} />
  }

  return <CredentialsWithVisitorAccount isUnknown={!!cred} />
}

export default CredentialsPage
