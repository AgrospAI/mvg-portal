import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useField } from 'formik'
import { InputProps } from '@shared/FormInput'
import styles from './index.module.css'
import dynamic from 'next/dynamic'

const MapWithDraw = dynamic(() => import('./MapWithDraw'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading map...</div>
})

interface BoundingBoxValue {
  wkt: string
  label?: string
}

export default function BoundingBoxMap({ ...props }: InputProps): ReactElement {
  const { name } = props
  const [field, , helpers] = useField<BoundingBoxValue | undefined>(name)
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)

  const handleBoundsChange = useCallback(
    (newBounds: L.LatLngBounds | null, label?: string) => {
      if (newBounds) {
        const sw = newBounds.getSouthWest()
        const ne = newBounds.getNorthEast()
        const wkt = `POLYGON((${sw.lng} ${sw.lat},${ne.lng} ${sw.lat},${ne.lng} ${ne.lat},${sw.lng} ${ne.lat},${sw.lng} ${sw.lat}))`
        helpers.setValue({
          wkt,
          label: label ?? field.value?.label ?? ''
        })
      } else {
        helpers.setValue({ wkt: '', label: field.value?.label || '' })
      }
    },
    [helpers, field.value?.label]
  )

  const handleClear = useCallback(() => {
    setBounds(null)
    helpers.setValue({ wkt: '', label: field.value?.label || '' })
  }, [helpers, field.value?.label])

  useEffect(() => {
    if (field.value?.wkt && !bounds) {
      const { wkt } = field.value
      const coordsMatch = wkt.match(/POLYGON\s*\(\(([^)]+)\)\)/i)
      if (coordsMatch) {
        const pairs = coordsMatch[1]
          .split(',')
          .map((pair) => {
            const parts = pair.trim().split(/\s+/)
            return [parseFloat(parts[0]), parseFloat(parts[1])] as [
              number,
              number
            ]
          })
          .filter(([lng, lat]) => !isNaN(lng) && !isNaN(lat))

        if (pairs.length >= 3) {
          const lngs = pairs.map(([lng]) => lng)
          const lats = pairs.map(([, lat]) => lat)
          const swLng = Math.min(...lngs)
          const swLat = Math.min(...lats)
          const neLng = Math.max(...lngs)
          const neLat = Math.max(...lats)
          if (typeof window !== 'undefined') {
            import('leaflet').then((L) => {
              setBounds(L.latLngBounds([swLat, swLng], [neLat, neLng]))
            })
          }
        }
      }
    }
  }, [field.value?.wkt, bounds])

  return (
    <div className={styles.container}>
      <MapWithDraw
        bounds={bounds}
        onBoundsChange={handleBoundsChange}
        onClear={handleClear}
        initialSearch={
          !field.value?.wkt && field.value?.label
            ? field.value.label
            : undefined
        }
      />
      {field.value?.wkt && (
        <div className={styles.wktDisplay}>
          <span className={styles.wktLabel}>WKT:</span>
          <code className={styles.wktValue}>{field.value.wkt}</code>
        </div>
      )}
    </div>
  )
}
