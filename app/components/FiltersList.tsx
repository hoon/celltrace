import { useStore } from '@nanostores/react'
import { $pointFilters } from '~/store/points'

export function FiltersList() {
  const pointFilter2 = useStore($pointFilters)
  return (
    <div>
      <h3>Filters list</h3>
      {pointFilter2.map((f) => (
        <div id={f.id}>
          type: {f.type}, values: {f.values.join(', ')}
        </div>
      ))}
    </div>
  )
}
