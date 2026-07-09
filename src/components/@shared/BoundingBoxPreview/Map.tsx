import { ReactElement, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './index.module.css'

interface MapProps {
  bounds: L.LatLngBoundsExpression
}

export default function Map({ bounds }: MapProps): ReactElement {
  const latLngBounds =
    bounds instanceof L.LatLngBounds
      ? bounds
      : L.latLngBounds(bounds as [L.LatLngTuple, L.LatLngTuple])
  const mapRef = useRef<L.Map>(null)

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitBounds(latLngBounds, { padding: [30, 30] })
    }
  }, [latLngBounds])

  return (
    <MapContainer
      ref={mapRef}
      center={latLngBounds.getCenter()}
      zoom={6}
      className={styles.map}
      scrollWheelZoom={false}
      dragging={true}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Rectangle
        bounds={latLngBounds}
        pathOptions={{
          color: '#7b1173',
          weight: 2,
          fillOpacity: 0.2
        }}
      />
    </MapContainer>
  )
}
