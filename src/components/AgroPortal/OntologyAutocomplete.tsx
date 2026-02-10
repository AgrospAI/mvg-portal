import { ReactElement, useEffect, useState } from 'react'
import Select, { OnChangeValue } from 'react-select'
import styles from './OntologyAutocomplete.module.css'
import CreatableSelect from 'react-select/creatable'

interface AutoCompleteOption {
  label: string
  value: string
}

interface Props {
  ontologies: string[]
  setOntologies: (ontologies: string[]) => void
}

export default function OntologyAutocomplete({
  ontologies,
  setOntologies
}: Props): ReactElement {
  const [selected, setSelected] = useState<AutoCompleteOption[]>([])
  const [options, setOptions] = useState<AutoCompleteOption[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchOntologies = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/agroportal/ontologies`)
        const data: string[] = await response.json()

        const opts = data.map((ontology) => ({
          label: ontology,
          value: ontology
        }))

        setOptions((prevOptions) => [...prevOptions, ...opts])
      } catch (error) {
        console.error('Error fetching AgroPortal data:', error)
        setOptions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOntologies()
  }, [])

  const handleChange = (userInput: OnChangeValue<AutoCompleteOption, true>) => {
    setSelected(userInput as AutoCompleteOption[])
    setOntologies(
      (userInput as AutoCompleteOption[]).map((option) => option.value)
    )
  }

  return (
    <CreatableSelect
      isMulti
      isClearable
      options={options}
      className={styles.select}
      defaultValue={selected}
      hideSelectedOptions
      onChange={handleChange}
      openMenuOnClick
      isLoading={isLoading}
      placeholder="e.g. AGROVOC"
    />
  )
}
