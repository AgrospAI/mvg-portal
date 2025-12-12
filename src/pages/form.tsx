import { ReactElement } from 'react'
import Form from '../components/Form'
import Page from '../components/@shared/Page'

export default function TestPage(): ReactElement {
  return (
    <Page
      title="Cuestionario de Evaluación Empresarial"
      description="Página temporal para validar el formulario de cuestionario"
      uri="/test"
    >
      <Form />
    </Page>
  )
}
