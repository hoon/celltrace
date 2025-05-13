import { useStore } from '@nanostores/react'
import {
  $filteredEnbs,
  $filteredEutraBands,
  XnbBandValues,
} from '~/store/points'
import { disabledMultiSelectClassName } from '../style/common'

export function EutraCard() {
  const filteredEnbs = useStore($filteredEnbs)
  const filteredEutraBands = useStore($filteredEutraBands)

  return (
    <div>
      <div>
        <h3>eNB IDs</h3>
        <select multiple disabled className={disabledMultiSelectClassName}>
          {filteredEnbs.map((enb) => (
            <option key={enb} value={enb}>
              {enb === XnbBandValues.SDL_SUL ? 'SDL/SUL' : enb}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>E-UTRA (4G) bands</h3>
        <select multiple disabled className={disabledMultiSelectClassName}>
          {filteredEutraBands.map((band) => (
            <option key={band} value={band}>
              {band === XnbBandValues.UNKOWN ? 'Unknown' : band}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
