import { useStore } from '@nanostores/react'
import { $pointFilters, removeFilter } from '~/store/points'

export function FiltersList() {
  const pointFilter2 = useStore($pointFilters)
  return (
    <div>
      <h3>Filters list</h3>
      {pointFilter2.map((f) => (
        <div key={f.id}>
          type: {f.type}, values: {f.values.join(', ')}
          <button onClick={() => removeFilter(f.id)}>Remove</button>
        </div>
      ))}
    </div>
  )
}
