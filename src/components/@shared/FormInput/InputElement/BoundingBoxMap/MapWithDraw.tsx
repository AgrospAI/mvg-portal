import { ReactElement, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw'
import styles from './index.module.css'
import LocationSearch from './LocationSearch'

interface MapWithDrawProps {
  bounds: L.LatLngBounds | null
  onBoundsChange: (bounds: L.LatLngBounds | null, label?: string) => void
  onClear: () => void
  initialSearch?: string
}

function DrawControl({
  featureGroupRef,
  onBoundsChange,
  onClear
}: {
  featureGroupRef: React.RefObject<L.FeatureGroup>
  onBoundsChange: (bounds: L.LatLngBounds | null) => void
  onClear: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!featureGroupRef.current) return

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: {
          shapeOptions: {
            color: '#7b1173',
            weight: 2,
            fillOpacity: 0.2
          }
        },
        polygon: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true
      }
    })

    map.addControl(drawControl)

    const handleCreated = (e: L.DrawEvents.Created) => {
      const layer = e.layer as L.Rectangle
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers()
        featureGroupRef.current.addLayer(layer)
      }
      const layerBounds = layer.getBounds()
      onBoundsChange(layerBounds)
    }

    const handleEdited = (e: L.DrawEvents.Edited) => {
      const { layers } = e
      layers.eachLayer((layer) => {
        if (layer instanceof L.Rectangle) {
          onBoundsChange(layer.getBounds())
        }
      })
    }

    const handleDeleted = () => {
      onClear()
    }

    map.on(L.Draw.Event.CREATED, handleCreated)
    map.on(L.Draw.Event.EDITED, handleEdited)
    map.on(L.Draw.Event.DELETED, handleDeleted)

    return () => {
      map.removeControl(drawControl)
      map.off(L.Draw.Event.CREATED, handleCreated)
      map.off(L.Draw.Event.EDITED, handleEdited)
      map.off(L.Draw.Event.DELETED, handleDeleted)
    }
  }, [map, featureGroupRef, onBoundsChange, onClear])

  return null
}

export default function MapWithDraw({
  bounds,
  onBoundsChange,
  onClear,
  initialSearch
}: MapWithDrawProps): ReactElement {
  const featureGroupRef = useRef<L.FeatureGroup>(null)
  const mapRef = useRef<L.Map>(null)

  useEffect(() => {
    if (bounds && featureGroupRef.current && mapRef.current) {
      featureGroupRef.current.clearLayers()
      const rectangle = L.rectangle(bounds, {
        color: '#7b1173',
        weight: 2,
        fillOpacity: 0.2
      })
      featureGroupRef.current.addLayer(rectangle)
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds])

  const handleLocationSelect = useCallback(
    (
      locationBounds: {
        south: number
        north: number
        west: number
        east: number
      },
      displayName: string
    ) => {
      const newBounds = L.latLngBounds(
        [locationBounds.south, locationBounds.west],
        [locationBounds.north, locationBounds.east]
      )

      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers()
        const rectangle = L.rectangle(newBounds, {
          color: '#7b1173',
          weight: 2,
          fillOpacity: 0.2
        })
        featureGroupRef.current.addLayer(rectangle)
      }

      if (mapRef.current) {
        mapRef.current.fitBounds(newBounds, { padding: [50, 50] })
      }

      onBoundsChange(newBounds, displayName)
    },
    [onBoundsChange]
  )

  return (
    <div className={styles.mapWrapper}>
      <LocationSearch
        onLocationSelect={handleLocationSelect}
        defaultInputValue={initialSearch}
      />
      <MapContainer
        ref={mapRef}
        center={[46.0, 11.0]}
        zoom={6}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
          <DrawControl
            featureGroupRef={featureGroupRef}
            onBoundsChange={onBoundsChange}
            onClear={onClear}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  )
}
