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
        data-website-id="5caff1a8-feb8-43ef-8bb8-d81deb1499a4"
      />
      <Home />
    </Page>
  )
}
