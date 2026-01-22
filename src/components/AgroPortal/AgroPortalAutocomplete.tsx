import { ReactElement, useEffect, useState } from 'react'
import { matchSorter } from 'match-sorter'
import IconExternal from '@images/external.svg'
import type { AgroportalSearchResult } from '@components/AgroPortal/schema'
import { getTagsList } from '@utils/aquarius'
import { useCancelToken } from '@hooks/useCancelToken'
import { chainIds } from 'app.config'
import CreatableSelect from 'react-select/creatable'
import { InputProps } from '@components/@shared/FormInput'
import { useField } from 'formik'
import styles from './AgroPortalAutocomplete.module.css'
import { OnChangeValue } from 'react-select'

interface AutoCompleteOption {
  value: string
  label: string
  url?: string
  source?: 'local' | 'agroportal'
}

interface Props extends InputProps {
  ontology?: string
}

export default function AgroPortalAutocomplete({
  ontology = 'AGROVOC',
  ...props
}: Props): ReactElement {
  const { name } = props
  const [, , helpers] = useField(name)

  const [input, setInput] = useState<string>('')
  const [selected, setSelected] = useState<AutoCompleteOption[]>([])
  const [localTags, setLocalTags] = useState<AutoCompleteOption[]>([])
  const [matchedLocalTags, setMatchedLocalTags] = useState<
    AutoCompleteOption[]
  >([])
  const [matchedAgroportalOptions, setMatchedAgroportalOptions] = useState<
    AutoCompleteOption[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const newCancelToken = useCancelToken()

  // Fetch tags once
  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getTagsList(chainIds, newCancelToken())
      setLocalTags(
        tags.map((tag) => ({ value: tag, label: tag, source: 'local' }))
      )
    }
    fetchTags()
  }, [])

  // Fetch AgroPortal options when input changes
  useEffect(() => {
    if (!input) {
      setMatchedLocalTags(localTags)
      setMatchedAgroportalOptions([])
      return
    }

    setMatchedLocalTags(matchSorter(localTags, input, { keys: ['value'] }))

    const controller = new AbortController()
    const debounceTimeout = setTimeout(() => {
      const fetchAgroPortal = async () => {
        try {
          setIsLoading(true)

          const searchParams = new URLSearchParams({
            q: input,
            ontology,
            page: '1',
            pagesize: '10'
          })
          const response = await fetch(
            `/api/agroportal/search?${searchParams.toString()}`,
            {
              signal: controller.signal
            }
          )
          const data: AgroportalSearchResult = await response.json()
          const opts: AutoCompleteOption[] = (data.collection || []).map(
            (item) => ({
              value: item.prefLabel,
              label: item.prefLabel,
              url: item.links?.ui,
              source: 'agroportal' as const
            })
          )
          setMatchedAgroportalOptions(
            matchSorter(opts, input, { keys: ['value'] })
          )
        } catch (error) {
          console.error('Error fetching AgroPortal data:', error)
          setMatchedAgroportalOptions([])
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
  }, [input, ontology, localTags])

  const handleChange = (userInput: OnChangeValue<AutoCompleteOption, true>) => {
    setSelected(userInput as AutoCompleteOption[])
    const normalizedInput = userInput.map((input) => input.value)
    helpers.setValue(normalizedInput)
    helpers.setTouched(true)
  }

  const groupedOptions = [
    { label: 'Tags', options: matchedLocalTags },
    { label: ontology, options: matchedAgroportalOptions }
  ]

  return (
    <CreatableSelect
      defaultValue={selected}
      hideSelectedOptions
      isMulti
      isClearable={false}
      onChange={handleChange}
      onInputChange={setInput}
      className={styles.select}
      openMenuOnClick
      options={groupedOptions}
      placeholder={'e.g. agrospai'}
      isLoading={isLoading}
      createOptionPosition="first"
      allowCreateWhileLoading
      formatGroupLabel={(group) => group.label}
      formatOptionLabel={(option: AutoCompleteOption) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginRight: 8
          }}
        >
          {option.source === 'agroportal' && option.url ? (
            <a
              href={option.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'inherit'
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
              <span style={{ fontWeight: 500, paddingBottom: 2 }}>
                {option.label}
              </span>
            </a>
          ) : (
            <span style={{ fontWeight: 500, paddingBottom: 2 }}>
              {option.label}
            </span>
          )}
        </div>
      )}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
    />
  )
}
