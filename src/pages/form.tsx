import { ReactElement } from 'react'
import Form from '../components/Form'
import Page from '../components/@shared/Page'
import Head from 'next/head'

export default function PageForm(): ReactElement {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow"></meta>
      </Head>
      <Page
        title="Cuestionario de Evaluación Empresarial"
        description="Página temporal para validar el formulario de cuestionario"
        uri="/test"
      >
        <Form />
      </Page>
    </>
  )
}
