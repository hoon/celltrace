import type { Route } from './+types/home'
import { lazy } from 'react'
import { useState, useEffect, Suspense } from 'react'
import MyMap from '~/components/MyMap.client'
import 'leaflet/dist/leaflet.css'
import DataModal, { type CmCsvRow } from '~/components/DataModal'

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
  const [points, setPoints] = useState<CmCsvRow[]>([])

  useEffect(() => {
    setIsClient(true) // Ensures this runs only on the client side.
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }


  // const points: CmCsvRow[] = []

  function onCsvData({
    filename,
    data,
  }: {
    filename: string
    data: CmCsvRow[]
  }) {
    console.log(`onCsvData() called`)
    const newPoints = [...points, ...data]
    setPoints(newPoints)
  }

  // const MyMap = lazy(() => import('../components/MyMap.client'))
  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <MyMap points={points} />
      <DataModal
        className="fixed z-[1000] bg-white dark:bg-gray-950 top-6 right-6 p-4 rounded-md drop-shadow-md"
        onCsvData={onCsvData}
      />
    </Suspense>
  )
}
