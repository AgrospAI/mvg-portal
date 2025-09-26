import { useAutomation } from '@context/Automation/AutomationProvider'
import { ethers, Signer } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Address, useAccount, useSigner } from 'wagmi'

export const useAutoSigner = () => {
  const { address: accountId } = useAccount()
  const { data: wagmiSigner } = useSigner() // signer from wagmi
  const { autoWallet, isAutomationEnabled } = useAutomation()

  const [signerToUse, setSignerToUse] = useState<Signer | undefined>(
    wagmiSigner
  )
  const [accountIdToUse, setAccountIdToUse] = useState<Address | undefined>(
    accountId
  )

  const getAutoSigner = useCallback((): Signer | undefined => {
    let selectedSigner: Signer | undefined

    if (isAutomationEnabled && autoWallet) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      selectedSigner = autoWallet.connect(provider)
    } else {
      selectedSigner = wagmiSigner
    }

    // Update local state for convenience
    setSignerToUse(selectedSigner)
    setAccountIdToUse(
      isAutomationEnabled && autoWallet?.address
        ? (autoWallet.address as Address)
        : accountId
    )

    return selectedSigner
  }, [isAutomationEnabled, autoWallet, wagmiSigner, accountId])

  // Update signer whenever dependencies change (network, wallet, automation)
  useEffect(() => {
    getAutoSigner()
  }, [getAutoSigner])

  return { signer: signerToUse, accountId: accountIdToUse, getAutoSigner }
}
