import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { LatLngTuple } from 'leaflet'
import { useState, useEffect } from 'react'

const position: LatLngTuple = [51.505, -0.09]

export default function MyApp() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true) // Ensures this runs only on the client side.
  }, [])
  if (!isClient) {
    return null
  }

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br />
        </Popup>
      </Marker>
    </MapContainer>
  )
}
