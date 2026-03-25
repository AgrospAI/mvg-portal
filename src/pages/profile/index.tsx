import ProfileProvider from '@context/Profile'
import UserMetadataRequestsProvider from '@context/UserMetadataRequests'
import Page from '@shared/Page'
import { accountTruncate } from '@utils/wallet'
import { isAddress } from 'ethers/lib/utils'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useAutomation } from '../../@context/Automation/AutomationProvider'
import ProfilePage from '../../components/Profile'

export default function PageProfile(): ReactElement {
  const router = useRouter()
  const { address: accountId } = useAccount()
  const { autoWallet } = useAutomation()
  const [finalAccountId, setFinalAccountId] = useState<string>()
  const [ownAccount, setOwnAccount] = useState(false)

  // Have accountId in path take over, if not present fall back to web3
  useEffect(() => {
    async function init() {
      if (!router?.route) return

      // Path is root /profile, have web3 take over
      if (router.route === '/profile') {
        setFinalAccountId(accountId)
        setOwnAccount(true)
        return
      }

      const pathAccount = router.query.account as string

      // Path has ETH address
      if (isAddress(pathAccount)) {
        setOwnAccount(
          pathAccount === accountId || pathAccount === autoWallet?.address
        )
        const finalAccountId = pathAccount || accountId
        setFinalAccountId(finalAccountId)
      }
    }
    init()
  }, [router, accountId, autoWallet?.address])

  return (
    <Page
      uri={router.route}
      title={accountTruncate(finalAccountId)}
      noPageHeader
    >
      <ProfileProvider accountId={finalAccountId} ownAccount={ownAccount}>
        <ProfilePage accountId={finalAccountId} />
      </ProfileProvider>
    </Page>
  )
}
