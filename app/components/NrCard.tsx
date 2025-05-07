import { $filteredGnbs, $filteredNrBands } from '~/store/points'
import { useStore } from '@nanostores/react'

export function NrCard() {
  const filteredGnbs = useStore($filteredGnbs)
  const filteredNrBands = useStore($filteredNrBands)
  return (
    <div>
      <div>
        <h3>gNB IDs</h3>
        <select
          multiple
          disabled
          className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                    disabled:opacity-95
                    bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                    focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {filteredGnbs.map((gnb) => (
            <option key={gnb} value={gnb}>
              {gnb === -2 ? 'NSA' : gnb}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>NR bands</h3>
        <select
          multiple
          disabled
          className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                    disabled:opacity-95
                    bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                    focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {filteredNrBands.map((band) => (
            <option key={band} value={band}>
              {band === -2 ? 'NSA' : band}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
