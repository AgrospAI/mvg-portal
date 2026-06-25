import { ReactElement, useCallback } from 'react'
import AsyncSelect from 'react-select/async'
import { OnChangeValue } from 'react-select'
import { useField } from 'formik'
import { InputProps } from '@shared/FormInput'
import axios from 'axios'
import styles from './index.module.css'

interface AgrovocOption {
  readonly value: string
  readonly label: string
}

interface AgrovocConcept {
  uri: string
  prefLabel: string
}

const AGROVOC_API = 'https://agrovoc.fao.org/browse/rest/v1/search/'

async function searchAgrovoc(inputValue: string): Promise<AgrovocOption[]> {
  if (!inputValue || inputValue.length < 2) {
    return []
  }

  try {
    const response = await axios.get(AGROVOC_API, {
      params: {
        query: `${inputValue}*`,
        lang: 'en'
      }
    })

    const results = response.data?.results || []
    return results.map((result: { uri: string; prefLabel: string }) => ({
      value: result.uri,
      label: result.prefLabel
    }))
  } catch (error) {
    console.error('AGROVOC search error:', error)
    return []
  }
}

export default function AgrovocAutocomplete({
  ...props
}: InputProps): ReactElement {
  const { name, placeholder } = props
  const [field, , helpers] = useField<AgrovocConcept[]>(name)

  const loadOptions = useCallback(
    (inputValue: string): Promise<AgrovocOption[]> => {
      return searchAgrovoc(inputValue)
    },
    []
  )

  const generateAutocompleteOptions = (
    concepts: AgrovocConcept[]
  ): AgrovocOption[] => {
    return concepts?.map((concept) => ({
      value: concept.uri,
      label: concept.prefLabel
    }))
  }

  const defaultValue = field.value
    ? generateAutocompleteOptions(field.value)
    : []

  const handleChange = (newValue: OnChangeValue<AgrovocOption, true>) => {
    const concepts: AgrovocConcept[] = (newValue || []).map((option) => ({
      uri: option.value,
      prefLabel: option.label
    }))
    helpers.setValue(concepts)
    helpers.setTouched(true)
  }

  return (
    <AsyncSelect
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
      className={styles.select}
      defaultValue={defaultValue}
      cacheOptions
      defaultOptions={false}
      hideSelectedOptions
      isMulti
      isClearable={false}
      loadOptions={loadOptions}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 2
          ? 'Type at least 2 characters to search AGROVOC concepts.'
          : 'No AGROVOC concepts found.'
      }
      onChange={(value) => handleChange(value)}
      placeholder={placeholder || 'Search AGROVOC concepts...'}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
    />
  )
}
