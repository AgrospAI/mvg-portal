import { useAutomation } from '@context/Automation/AutomationProvider'
import { ethers, Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Address, useAccount, useSigner } from 'wagmi'

export const useAutoSigner = () => {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet, isAutomationEnabled } = useAutomation()

  const [signerToUse, setSignerToUse] = useState<Signer | undefined>(signer)
  const [accountToUse, setAccountToUse] = useState<Address | undefined>(address)

  const getAutoSigner = useCallback((): Signer | undefined => {
    let selectedSigner: Signer | undefined

    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    if (isAutomationEnabled && autoWallet) {
      selectedSigner = autoWallet.connect(provider)
    } else {
      selectedSigner = signer
    }

    // Update local state for convenience
    setSignerToUse(selectedSigner)
    setAccountToUse(
      isAutomationEnabled && autoWallet?.address
        ? (autoWallet.address as Address)
        : address
    )

    return selectedSigner
  }, [isAutomationEnabled, autoWallet, address, signer])

  // Update signer whenever dependencies change (network, wallet, automation)
  useEffect(() => {
    getAutoSigner()
  }, [getAutoSigner])

  return { signer: signerToUse, accountId: accountToUse, getAutoSigner }
}
