import { router } from 'next/router'
import { ReactElement } from 'react'
import ConsentsManagementPage from '@components/Asset/ConsentsManagement'
import AssetProvider from '@context/Asset'

export default function PageConsentsManagement(): ReactElement {
  const router = useRouter()
  const { did } = router.query
  return (
    <AssetProvider did={did as string}>
      <ConsentsManagementPage uri={router.pathname} />
    </AssetProvider>
  )
}
