import Button from '@components/@shared/atoms/Button'
import { useAutoSigner } from '@hooks/useAutoSigner'
import EthIcon from '@images/eth.svg'
import { useSwitchNetwork } from 'wagmi'
import styles from './index.module.css'

interface SwitchNetworkProps {
  chainId: number
  targetNetwork: number
}

export const SwitchNetwork = ({
  chainId,
  targetNetwork
}: Readonly<SwitchNetworkProps>) => {
  const { signer } = useAutoSigner()
  const { switchNetwork } = useSwitchNetwork({ chainId: targetNetwork })

  if (!signer) return null
  if (chainId === targetNetwork)
    return (
      <div className={styles.chainMessage}>
        Correct network
        <EthIcon />
      </div>
    )

  return (
    <Button
      style="text"
      type="button"
      onClick={() => {
        switchNetwork()
        // window.location.reload()
      }}
      className={styles.button}
    >
      Switch to asset&apos;s network
    </Button>
  )
}
