import { ReactElement } from 'react'
import AccountHeader from './Header'
import HistoryPage from './History'

export default function AccountPage({
  accountId
}: {
  accountId: string
}): ReactElement {
  return (
    <>
      <AccountHeader accountId={accountId} />
      <HistoryPage accountIdentifier={accountId} />
    </>
  )
}
