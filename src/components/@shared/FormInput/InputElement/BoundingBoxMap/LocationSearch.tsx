import { ReactElement, useCallback } from 'react'
import AsyncSelect from 'react-select/async'
import { SingleValue } from 'react-select'
import axios from 'axios'
import styles from './index.module.css'

interface NominatimResult {
  display_name: string
  boundingbox: [string, string, string, string] // [south, north, west, east]
}

interface LocationOption {
  readonly label: string
  readonly value: {
    south: number
    north: number
    west: number
    east: number
    displayName: string
  }
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

async function searchLocations(inputValue: string): Promise<LocationOption[]> {
  if (!inputValue || inputValue.length < 3) {
    return []
  }

  try {
    const response = await axios.get(NOMINATIM_API, {
      params: {
        q: inputValue,
        format: 'json',
        limit: 5
      }
    })

    return response.data.map((result: NominatimResult) => ({
      label: result.display_name,
      value: {
        south: parseFloat(result.boundingbox[0]),
        north: parseFloat(result.boundingbox[1]),
        west: parseFloat(result.boundingbox[2]),
        east: parseFloat(result.boundingbox[3]),
        displayName: result.display_name
      }
    }))
  } catch (error) {
    console.error('Nominatim search error:', error)
    return []
  }
}

interface LocationSearchProps {
  onLocationSelect: (
    bounds: { south: number; north: number; west: number; east: number },
    displayName: string
  ) => void
  defaultInputValue?: string
}

export default function LocationSearch({
  onLocationSelect,
  defaultInputValue
}: LocationSearchProps): ReactElement {
  const loadOptions = useCallback(
    (inputValue: string): Promise<LocationOption[]> => {
      return searchLocations(inputValue)
    },
    []
  )

  const handleChange = (newValue: SingleValue<LocationOption>) => {
    if (newValue) {
      const { south, north, west, east, displayName } = newValue.value
      onLocationSelect({ south, north, west, east }, displayName)
    }
  }

  return (
    <AsyncSelect
      components={{
        DropdownIndicator: () => null,
        IndicatorSeparator: () => null
      }}
      className={styles.locationSearch}
      cacheOptions
      defaultOptions={false}
      defaultInputValue={defaultInputValue}
      loadOptions={loadOptions}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < 3
          ? 'Type at least 3 characters to search.'
          : 'No locations found.'
      }
      onChange={handleChange}
      placeholder="Search for a city or region..."
      value={null}
      theme={(theme) => ({
        ...theme,
        colors: { ...theme.colors, primary25: 'var(--border-color)' }
      })}
    />
  )
}
