import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import { useState, useEffect } from 'react'
import {
  nrArfcnToBands,
  nrArfcnToFrequency,
  earfcnToBand,
  earfcnToFrequency,
} from 'arfcn'
import type { CmCsvRow, CellMeasurement } from './DataModal'

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

export default function MyApp({ points }: { points: CmCsvRow[] }) {
  const [isClient, setIsClient] = useState(false)

  // useEffect(() => {
  //   setIsClient(true) // Ensures this runs only on the client side.
  // }, [])
  // if (!isClient) {
  //   return null
  // }

  const mPoints: CellMeasurement[] = points.map(
    (p: CmCsvRow): CellMeasurement => {
      const freqmhz = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return earfcnToFrequency(_p.arfcn)
        } else if (_p.type === 'NR') {
          return nrArfcnToFrequency(_p.arfcn)
        }
        return -1
      })(p)

      const band = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return earfcnToBand(_p.arfcn)
        } else if (_p.type === 'NR') {
          const bands = nrArfcnToBands(_p.arfcn)
          if (bands.length > 0) {
            return bands[0]
          }
        }
        return -1
      })(p)

      const xnb = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return _p.cid >> 8
        } else if (_p.type === 'NR') {
          return _p.cid >> 14
        }
        return -1
      })(p)

      const cellno = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return _p.cid & 0xff
        } else if (_p.type === 'NR') {
          return _p.cid & 0x3fff
        }
        return -1
      })(p)

      return {
        ...p,
        freqmhz,
        band,
        xnb,
        cellno,
      } as CellMeasurement
    }
  )

  // const enbs = [
  //   ...new Set(mPoints.filter((p) => p.type === 'LTE').map((p) => p.xnb)),
  // ]
  // const gnbs = [
  //   ...new Set(mPoints.filter((p) => p.type === 'NR').map((p) => p.xnb)),
  // ]
  // const earfcns = [
  //   ...new Set(mPoints.filter((p) => p.type === 'LTE').map((p) => p.arfcn)),
  // ]
  // const nrarfcns = [
  //   ...new Set(mPoints.filter((p) => p.type === 'NR').map((p) => p.arfcn)),
  // ]

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
