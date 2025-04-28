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
  $cellMeasurements,
  $pointFilter,
} from '~/store/points'
import { useStore } from '@nanostores/react'

const position: LatLngTuple = [43.466667, -80.516667]

function determinePointColour(signalDbm: number) {
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

export default function MyApp() {
  const [isClient, setIsClient] = useState(false)

  const points = useStore($cellMeasurements)
  const pointFilter = useStore($pointFilter)

  const filteredPoints = points
    .filter((p) => pointFilter.enbs.includes(p.xnb))
    .filter((p) => pointFilter.eutraBands.includes(p.band))

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
          // console.log(`point: ${JSON.stringify(p)}`)
          // if (!p.lat) return <></>
          // if (!p.lat) console.log('undefined latitude')

          // console.log(`m-${i}`)
          const pColour = determinePointColour(p.signal)
          return (
            <CircleMarker
              key={`m-${i}`}
              center={[p.lat, p.lng]}
              radius={2}
              color={pColour}
              fillColor={pColour}
            ></CircleMarker>
          )
          // return (<></>)
        })}
      </>
      {/* {points[0] && <CircleMarker key="hey" center={[points[0].lat, points[0].lng]} radius={2}/>} */}
      {/* {points.length > 0 && <Marker position={[position[0], position[1] + 0.001]} />} */}
      {/* <></> */}
    </MapContainer>
  )
}
