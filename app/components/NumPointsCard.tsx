import { $numCmMeasurements, $numFilteredPoints } from '~/store/points'
import { useStore } from '@nanostores/react'

export function NumPointsCard() {
  const numCmMeasurements = useStore($numCmMeasurements)
  const numFilteredPoints = useStore($numFilteredPoints)

  return (
    <div className="w-80 text-sm">
      {numFilteredPoints} of {numCmMeasurements} displayed
    </div>
  )
}
