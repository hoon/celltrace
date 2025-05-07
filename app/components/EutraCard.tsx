import { useStore } from '@nanostores/react'
import { $filteredEnbs, $filteredEutraBands } from '~/store/points'

export function EutraCard() {
  const filteredEnbs = useStore($filteredEnbs)
  const filteredEutraBands = useStore($filteredEutraBands)

  return (
    <div>
      <div>
        <h3>eNB IDs</h3>
        <select
          multiple
          disabled
          className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                disabled:opacity-95
                bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {filteredEnbs.map((enb) => (
            <option key={enb} value={enb}>
              {enb === -3 ? 'SDL/SUL' : enb}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>E-UTRA (4G) bands</h3>
        <select
          multiple
          disabled
          className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                disabled:opacity-95
                bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {filteredEutraBands.map((band) => (
            <option key={band} value={band}>
              {band}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
