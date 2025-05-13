import { useStore } from '@nanostores/react'
import {
  $pointFilters,
  removeFilter,
  XnbBandValues,
  type PointFilter,
} from '~/store/points'

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
      signalStrength: 'signal strength',
    }
    return transText[text] ?? text
  }

  function getFormattedValuesString(values: number[]) {
    return values
      .map((val) => {
        switch (val) {
          case XnbBandValues.NSA:
            return 'NSA'
          case XnbBandValues.SDL_SUL:
            return 'SDL/SUL'
          default:
            return val.toString()
        }
      })
      .join(',')
  }

  function getFilterDescriptionElements(filter: PointFilter) {
    const elements: React.ReactNode[] = []

    if (['enb', 'gnb', 'eutraBand', 'nrBand'].includes(filter.type)) {
      elements.push(
        <span className="mr-2">
          {getDispText(filter.mode)} {getDispText(filter.type)} values{' '}
          {getFormattedValuesString(filter.values)}
        </span>
      )
    } else if (filter.type === 'signalStrength') {
      elements.push(
        <span className="mr-2">
          {getDispText(filter.mode)} {getDispText(filter.type)} between{' '}
          {filter.values[0] === Number.NEGATIVE_INFINITY
            ? '-∞'
            : filter.values[0]}{' '}
          and{' '}
          {filter.values[1] === Number.POSITIVE_INFINITY
            ? '∞'
            : filter.values[1]}
        </span>
      )
    } else {
      elements.push(
        <span className="mr-2">
          {getDispText(filter.mode)} {getDispText(filter.type)} values{' '}
          {filter.values.join(', ')}
        </span>
      )
    }

    if (filter.colour) {
      elements.push(
        <div
          style={{
            display: 'inline-block',
            width: '0.9em',
            height: '0.9em',
            backgroundColor: filter.colour,
          }}
          className="mr-2"
        ></div>
      )
    }

    return elements
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
            {getFilterDescriptionElements(f)}

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
