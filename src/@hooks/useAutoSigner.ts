import { useAutomation } from '@context/Automation/AutomationProvider'
import { useEffect, useState } from 'react'
import { Address, useAccount, useSigner } from 'wagmi'

export const useAutoSigner = () => {
  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet, isAutomationEnabled } = useAutomation()

  const [signerToUse, setSignerToUse] = useState(signer)
  const [accountIdToUse, setAccountIdToUse] = useState<Address>(accountId)

  useEffect(() => {
    setSignerToUse(isAutomationEnabled ? autoWallet : signer)
    setAccountIdToUse(
      isAutomationEnabled && autoWallet?.address
        ? (autoWallet.address as Address)
        : accountId
    )
  }, [isAutomationEnabled, accountId, autoWallet, signer])

  return { signer: signerToUse, accountId: accountIdToUse }
}
