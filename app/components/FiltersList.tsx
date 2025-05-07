import { useStore } from '@nanostores/react'
import { $pointFilters, removeFilter } from '~/store/points'

export function FiltersList() {
  const pointFilter2 = useStore($pointFilters)
  return (
    <div>
      <h3>Filters list</h3>
      {pointFilter2.map((f) => (
        <div key={f.id} className="w-fit">
          <span className="mr-2">
            mode: {f.mode}, type: {f.type}, values: {f.values.join(', ')}
          </span>
          {f.colour && (
            <div
              style={{
                display: 'inline-block',
                width: '1em',
                height: '1em',
                backgroundColor: f.colour,
              }}
              className="mr-2"
            ></div>
          )}
          <button
            className="bg-violet-50 text-violet-700 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
            onClick={() => removeFilter(f.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}
