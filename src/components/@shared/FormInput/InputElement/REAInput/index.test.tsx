import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Field, Formik } from 'formik'
import REAInput from './index'
import TabsFile from '@shared/atoms/TabsFile'
import content from '../../../../../../content/publish/form.json'

jest.mock('@shared/FormInput', () => ({
  __esModule: true,
  default: ({ label, name, ...props }) => (
    <label>
      {label}
      <input name={name} {...props} />
    </label>
  )
}))

const name = 'services[0].files'
const reaField = content.services.fields
  .find((field) => field.name === 'files')
  .fields.find((field) => field.type === 'rea')
const endpoint = 'endpoint' in reaField ? reaField.endpoint : ''

function renderForm(url = '') {
  return render(
    <Formik
      initialValues={{
        services: [{ files: [{ type: 'url', url, valid: !!url }] }]
      }}
      onSubmit={jest.fn()}
    >
      <>
        <TabsFile
          items={[
            {
              title: 'URL',
              field: { value: 'url' },
              props: { name, value: [{ type: 'url' }] },
              content: <button>Validate</button>
            },
            {
              title: 'REA',
              field: reaField,
              props: { name, value: [{ type: 'url' }] },
              content: <REAInput name={name} endpoint={endpoint} />
            }
          ]}
        />
        <Field name={name}>
          {({ field }) => (
            <output data-testid="file">{JSON.stringify(field.value[0])}</output>
          )}
        </Field>
      </>
    </Formik>
  )
}

function currentFile() {
  return JSON.parse(screen.getByTestId('file').textContent)
}

describe('REA file input', () => {
  it('offers the 19 communities and no validation button', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('tab', { name: 'REA' }))
    expect(screen.getAllByRole('option')).toHaveLength(20)
    expect(screen.getByRole('option', { name: 'Cataluña' })).toHaveValue('09')
    expect(
      screen.queryByRole('option', { name: /Integración/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Validate' })
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Community'), {
      target: { value: '09' }
    })
    fireEvent.change(screen.getByLabelText('Holder NIF'), {
      target: { value: '12345678X&other=value' }
    })
    await waitFor(() =>
      expect(currentFile()).toEqual({
        type: 'url',
        url: `${endpoint}?community_code=09&holder_nif=12345678X%26other%3Dvalue`,
        valid: true
      })
    )

    fireEvent.change(screen.getByLabelText('Holder NIF'), {
      target: { value: ' ' }
    })
    await waitFor(() =>
      expect(currentFile()).toEqual({ type: 'url', url: '', valid: false })
    )
  })

  it('restores REA fields from the URL when returning to the step', () => {
    renderForm(`${endpoint}?community_code=09&holder_nif=12345678X`)
    expect(screen.getByRole('tab', { name: 'REA' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByLabelText('Community')).toHaveValue('09')
    expect(screen.getByLabelText('Holder NIF')).toHaveValue('12345678X')
    expect(
      screen.queryByRole('button', { name: 'Validate' })
    ).not.toBeInTheDocument()
  })

  it('clears the sensitive URL when switching to another file option', async () => {
    renderForm(`${endpoint}?community_code=09&holder_nif=12345678X`)
    fireEvent.click(screen.getByRole('tab', { name: 'URL' }))
    await waitFor(() => expect(currentFile()).toEqual({ type: 'url', url: '' }))
  })
})
