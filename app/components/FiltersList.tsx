import { useStore } from '@nanostores/react'
import { $pointFilters, removeFilter } from '~/store/points'

export function FiltersList() {
  const pointFilters = useStore($pointFilters)

  function getDispText(text: string) {
    const transText: Record<string, string> = {
      includeOnly: 'Include only',
      colour: 'Colour',
      enb: 'eNB',
      gnb: 'gNB',
      cellNo: 'Cell no.',
      eutraBand: 'e-UTRA band',
      nrBand: 'NR band',
      signalStrength: 'Signal strength',
    }
    return transText[text] ?? text
  }

  return (
    <div>
      <h3>Filters list</h3>
      {pointFilters.length === 0 && (
        <p className="ml-2 text-sm text-gray-300">No filters added</p>
      )}
      <ul>
        {pointFilters.map((f) => (
          <li
            key={f.id}
            className="w-fit text-sm before:content-['{}'] before:mr-1"
          >
            <span className="mr-2">
              {getDispText(f.mode)} {getDispText(f.type)} values{' '}
              {f.values.join(', ')}
            </span>
            {f.colour && (
              <div
                style={{
                  display: 'inline-block',
                  width: '0.9em',
                  height: '0.9em',
                  backgroundColor: f.colour,
                }}
                className="mr-2"
              ></div>
            )}

            <button
              className="bg-violet-50 text-violet-700 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200
                py-[0.25em] px-2 rounded-lg text-xs font-semibold"
              onClick={() => removeFilter(f.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
