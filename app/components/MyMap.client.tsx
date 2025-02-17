import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import { useState, useEffect } from 'react'
import type { CmCsvRow } from './DataModal'

const position: LatLngTuple = [43.466667, -80.516667]

export default function MyApp({ points }: { points: CmCsvRow[] }) {
  const [isClient, setIsClient] = useState(false)

  // useEffect(() => {
  //   setIsClient(true) // Ensures this runs only on the client side.
  // }, [])
  // if (!isClient) {
  //   return null
  // }

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
        {points.map((p, i) => {
          // console.log(`point: ${JSON.stringify(p)}`)
          // if (!p.lat) return <></>
          // if (!p.lat) console.log('undefined latitude')

          // console.log(`m-${i}`)
          return (
            <CircleMarker
              key={`m-${i}`}
              center={[p.lat, p.lng]}
              radius={2}
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
