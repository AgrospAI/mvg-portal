import { ReactElement, useEffect, useState } from 'react'
import { matchSorter } from 'match-sorter'
import IconExternal from '@images/external.svg'
import type { AgroportalSearchResult } from '@components/AgroPortal/schema'
import Select from 'react-select'
import { InputProps } from '@components/@shared/FormInput'
import { useField } from 'formik'
import styles from './AgroPortalAutocomplete.module.css'
import { OnChangeValue } from 'react-select'
import OntologyAutocomplete from './OntologyAutocomplete'

interface OntologyTerm {
  '@id': string
  '@type': string
  'skos:prefLabel': {
    '@value': string
    '@language': string
  }
  'skos:inScheme': {
    '@id': string
    'rdfs:label': string
  }
  'dct:source': {
    '@id': string
  }
}

interface Props extends InputProps {}

export default function AgroPortalAutocomplete({
  ...props
}: Props): ReactElement {
  const { name } = props
  const [field, , helpers] = useField(name)

  const [input, setInput] = useState<string>('')
  const defaultSelected =
    Array.isArray(field.value) && field.value.length > 0 ? field.value : []
  const [selected, setSelected] = useState<OntologyTerm[]>(defaultSelected)
  const [options, setOptions] = useState<OntologyTerm[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [ontologies, setOntologies] = useState<string[]>([])
  const ontologiesString = ontologies.join(',')

  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)

  // Fetch AgroPortal options when input changes
  useEffect(() => {
    if (!input) {
      setOptions([])
      return
    }

    const controller = new AbortController()
    const debounceTimeout = setTimeout(() => {
      const fetchAgroPortal = async () => {
        try {
          setIsLoading(true)

          const searchParams = new URLSearchParams({
            q: input,
            page: page.toString(),
            pagesize: '10',
            language: 'en'
          })

          if (ontologiesString) {
            searchParams.append('ontologies', ontologiesString)
          }

          const response = await fetch(
            `/api/agroportal/search?${searchParams.toString()}`,
            {
              signal: controller.signal
            }
          )
          const data: AgroportalSearchResult = await response.json()
          const opts: OntologyTerm[] = (data.collection || []).map((item) => ({
            '@id': item['@id'],
            '@type': 'skos:Concept',
            'skos:prefLabel': {
              '@value': item.prefLabel,
              '@language': 'en'
            },
            'skos:inScheme': {
              '@id': item.links.ontology,
              'rdfs:label': item.links.ontology.split('/').pop() || ''
            },
            'dct:source': {
              '@id': item.links.ui
            }
          }))
          setOptions((prevOptions) => [...prevOptions, ...opts])
          setHasMore(data.nextPage !== null)
        } catch (error) {
          console.error('Error fetching AgroPortal data:', error)
          setOptions([])
        } finally {
          setIsLoading(false)
        }
      }
      fetchAgroPortal()
    }, 400)
    return () => {
      controller.abort()
      clearTimeout(debounceTimeout)
    }
  }, [input, ontologiesString, page])

  const handleChange = (userInput: OnChangeValue<OntologyTerm, true>) => {
    setSelected(userInput as OntologyTerm[])
    helpers.setValue(userInput)
    helpers.setTouched(true)
  }

  const handleInputChange = (newValue: string) => {
    setInput(newValue)
    setPage(1)
    setOptions([])
  }

  const onLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Select
        defaultValue={selected}
        hideSelectedOptions
        getOptionValue={(option) => option?.['@id']}
        getOptionLabel={(option) => option?.['skos:prefLabel']?.['@value']}
        isMulti
        isClearable={false}
        onChange={handleChange}
        onInputChange={handleInputChange}
        className={styles.select}
        openMenuOnClick
        options={options}
        placeholder={'e.g. agriculture, plant, soil...'}
        isLoading={isLoading}
        onMenuScrollToBottom={onLoadMore}
        noOptionsMessage={() => 'No results found'}
        formatOptionLabel={(option: OntologyTerm) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginRight: 8
            }}
          >
            <a
              href={option['dct:source']?.['@id'] || '#'}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'inherit'
              }}
              onClick={(e) => {
                if (!option['dct:source']?.['@id']) {
                  e.preventDefault()
                }
              }}
            >
              <IconExternal
                style={{
                  width: 8,
                  height: 8,
                  marginRight: 8,
                  color: 'inherit'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 500, paddingBottom: 4 }}>
                  {option?.['skos:prefLabel']?.['@value']}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
                  {option?.['skos:inScheme']?.['rdfs:label']}
                </span>
              </div>
            </a>
          </div>
        )}
        theme={(theme) => ({
          ...theme,
          colors: { ...theme.colors, primary25: 'var(--border-color)' }
        })}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Filter search by ontology
        </span>
        <OntologyAutocomplete
          ontologies={ontologies}
          setOntologies={setOntologies}
        />
      </div>
    </div>
  )
}
