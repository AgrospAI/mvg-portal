import { useUserPreferences } from '@context/UserPreferences'
import { useAddressConfig } from '@hooks/useAddressConfig'
import Jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Avatar from '@shared/atoms/Avatar'
import Copy from '@shared/atoms/Copy'
import ExplorerLink from '@shared/ExplorerLink'
import NetworkName from '@shared/NetworkName'
import { accountTruncate } from '@utils/wallet'
import { ReactElement } from 'react'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import Transaction from '../../../@images/transaction.svg'
import styles from './Account.module.css'
import { VerifiableCredential } from './VerifiableCredential'
import { Address } from 'wagmi'

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { autoWalletAddress } = useAutomation()
  const { verifiedAddresses } = useAddressConfig()

  function getAddressKey(): string {
    const addressKey = Object.keys(verifiedAddresses).find(
      (key) => key.toLowerCase() === accountId?.toLowerCase()
    )
    return addressKey || ''
  }

  const renderName = () => {
    return (
      <h3 className={styles.name}>
        {verifiedAddresses?.[getAddressKey()] || accountTruncate(accountId)}{' '}
        <VerifiableCredential address={accountId as Address} />
        {autoWalletAddress === accountId && (
          <span className={styles.automation} title="Automation">
            <Transaction />
          </span>
        )}
      </h3>
    )
  }

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {accountId ? (
          <Avatar accountId={accountId} className={styles.image} />
        ) : (
          <Jellyfish className={styles.image} />
        )}
      </figure>
      <div>
        {renderName()}
        {accountId && (
          <code className={styles.accountId}>
            {accountId} <Copy text={accountId} />
          </code>
        )}
        <p>
          {accountId &&
            chainIds.map((value) => (
              <ExplorerLink
                className={styles.explorer}
                networkId={value}
                path={`address/${accountId}`}
                key={value}
              >
                <NetworkName networkId={value} />
              </ExplorerLink>
            ))}
        </p>
      </div>
    </div>
  )
}
