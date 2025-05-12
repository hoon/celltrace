import type { Route } from './+types/home'
import { useState, useEffect, Suspense } from 'react'
import MyMap from '~/components/MyMap.client'
import 'leaflet/dist/leaflet.css'
import DataModal from '~/components/DataModal'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'celltrace' },
    {
      name: 'description',
      content: 'Trace and narrow down your cell measurement trails',
    },
  ]
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true) // Ensures this runs only on the client side.
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <MyMap />
      <DataModal
        className="fixed z-[1000] max-h-[calc(100vh-4rem)]
          w-[100vw] sm:w-80 sm:max-w-4/5
          bg-white dark:bg-gray-950 top-2
          sm:top-4 sm:right-4 
          p-4 rounded-md drop-shadow-md overflow-auto"
      />
    </Suspense>
  )
}
