import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import { useState } from 'react'
import {
  $filteredPoints,
  $pointFilters,
  type CellMeasurement,
  type PointFilter,
} from '~/store/points'
import { useStore } from '@nanostores/react'

const position: LatLngTuple = [43.466667, -80.516667]

function getSignalStrengthColour(signalDbm: number) {
  // [0, -85] => rgba(0, 255, 0, 0.8)
  // [-85, -95] => rgba(50, 200, 0, 0.8)
  // [-95, -105] => rgba(50, 100, 0, 0.8)
  // [-105, -115] => rgba(50, 50, 0, 0.8)
  // [-115, -140] => rgba(255, 50, 0, 0.8)
  // [-140, -infinity] => rgba(255, 0, 0, 0.8)

  if (signalDbm >= -85) {
    return 'rgba(0, 255, 0, 0.8)'
  } else if (signalDbm < -85 && signalDbm >= -95) {
    return 'rgba(50, 200, 0, 0.8)'
  } else if (signalDbm < -95 && signalDbm >= -105) {
    return 'rgba(50, 100, 0, 0.8)'
  } else if (signalDbm < -105 && signalDbm >= -115) {
    return 'rgba(50, 50, 0, 0.8)'
  } else if (signalDbm < -115 && signalDbm >= -140) {
    return 'rgba(255, 50, 0, 0.8)'
  } else if (signalDbm < -140) {
    return 'rgba(255, 0, 0, 0.8)'
  }

  return 'rgba(255, 246, 0, 0.8)'
}

function getPointColour(pointFilters: PointFilter[], point: CellMeasurement) {
  let colour: string | undefined = undefined
  for (const pf of pointFilters.filter((pf) => pf.mode === 'colour')) {
    if (pf.type === 'enb' && point.type === 'LTE') {
      if (pf.values.includes(point.xnb)) {
        colour = pf.colour
      }
    } else if (pf.type === 'gnb' && point.type === 'NR') {
      if (pf.values.includes(point.xnb)) {
        colour = pf.colour
      }
    } else if (pf.type === 'eutraBand' && point.type === 'LTE') {
      if (pf.values.includes(point.band)) {
        colour = pf.colour
      }
    } else if (pf.type === 'nrBand' && point.type === 'NR') {
      if (pf.values.includes(point.band)) {
        colour = pf.colour
      }
    } else if (pf.type === 'cellNo') {
      if (pf.values.includes(point.cellno)) {
        colour = pf.colour
      }
    }
  }
  return colour ?? getSignalStrengthColour(point.signal)
}

export default function MyApp() {
  const [isClient, setIsClient] = useState(false)

  const filteredPoints = useStore($filteredPoints)
  const pointFilters = useStore($pointFilters)

  console.log(`MyMap(): ${Date.now()}`)

  return (
    <MapContainer
      key="mainmap"
      center={position}
      zoom={13}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br />
        </Popup>
      </Marker>
      <>
        {filteredPoints.map((p, i) => {
          const pColour = getPointColour(pointFilters, p)

          return (
            <CircleMarker
              key={`m-${i}-${pColour}`}
              center={[p.lat, p.lng]}
              radius={2}
              color={pColour}
              fillColor={pColour}
            ></CircleMarker>
          )
        })}
      </>
    </MapContainer>
  )
}
