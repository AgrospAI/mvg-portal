import { ReactElement } from 'react'
import Home from '../components/Home'
import Page from '@shared/Page'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import Script from 'next/script'

export default function PageHome(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const router = useRouter()

  return (
    <Page
      title={siteContent?.siteTitle}
      description={siteContent?.siteTagline}
      uri={router.route}
      headerCenter
    >
      <Script
        defer
        src="https://umami.agrospai.udl.cat/umami"
        data-website-id="dd68db0f-4cc5-4114-b3b2-9d9621a7ce27"
      />
      <Home />
    </Page>
  )
}
