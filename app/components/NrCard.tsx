import { useStore } from '@nanostores/react'
import { $filteredGnbs, $filteredNrBands, XnbBandValues } from '~/store/points'
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
              {gnb === XnbBandValues.NSA
                ? 'NSA'
                : gnb === XnbBandValues.SDL_SUL
                ? 'SDL/SUL'
                : gnb}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>NR bands</h3>
        <select multiple disabled className={disabledMultiSelectClassName}>
          {filteredNrBands.map((band) => (
            <option key={band} value={band}>
              {band === XnbBandValues.NSA ? 'NSA' : band}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
