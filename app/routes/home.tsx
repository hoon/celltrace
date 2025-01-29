import type { Route } from './+types/home'
import { lazy } from 'react'
import { useState, useEffect, Suspense } from 'react'
import 'leaflet/dist/leaflet.css'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
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

  const MyMap = lazy(() => import('../components/MyMap'))
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <MyMap />
    </Suspense>
  )
}
