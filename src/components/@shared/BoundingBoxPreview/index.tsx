import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import styles from './index.module.css'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading map...</div>
})

function parseWktBounds(
  wkt: string
): [[number, number], [number, number]] | null {
  const match = wkt.match(
    /POLYGON\(\(([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)\)/
  )
  if (!match) return null

  const swLng = parseFloat(match[1])
  const swLat = parseFloat(match[2])
  const neLng = parseFloat(match[5])
  const neLat = parseFloat(match[6])

  if ([swLng, swLat, neLng, neLat].some(isNaN)) return null

  return [
    [swLat, swLng],
    [neLat, neLng]
  ]
}

export default function BoundingBoxPreview({
  wkt
}: {
  wkt: string
}): ReactElement | null {
  const bounds = parseWktBounds(wkt)
  if (!bounds) return null

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Geographic Coverage</h4>
      <Map bounds={bounds} />
    </div>
  )
}
