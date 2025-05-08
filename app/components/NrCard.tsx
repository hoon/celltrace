import { useStore } from '@nanostores/react'
import { $filteredGnbs, $filteredNrBands } from '~/store/points'
import { disabledMultiSelectClassName } from '../style/common'

export function NrCard() {
  const filteredGnbs = useStore($filteredGnbs)
  const filteredNrBands = useStore($filteredNrBands)
  return (
    <div>
      <div>
        <h3>gNB IDs</h3>
        <select multiple disabled className={disabledMultiSelectClassName}>
          {filteredGnbs.map((gnb) => (
            <option key={gnb} value={gnb}>
              {gnb === -2 ? 'NSA' : gnb}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>NR bands</h3>
        <select multiple disabled className={disabledMultiSelectClassName}>
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
