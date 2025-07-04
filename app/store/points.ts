import {
  earfcnToBand,
  earfcnToFrequency,
  nrArfcnToFrequency,
  nrArfcnToBands,
  uarfcnToBands,
  LinkDirection,
  uarfcnToFrequencyFdd,
} from 'arfcn'
import { atom, computed } from 'nanostores'

export interface CmCsvRow {
  lat: number
  lng: number
  alt: number
  mcc: number
  mnc: number
  lac: number
  cid: number
  signal: number
  type: 'GSM' | 'UMTS' | 'CDMA' | 'LTE' | 'NR'
  subtype: string
  arfcn: number
  pci: number
}

export interface CellMeasurement extends CmCsvRow {
  freqmhz: number
  band: number
  xnb: number
  cellno: number
}

export enum XnbBandValues {
  UNKNOWN = -1,
  NSA = -2,
  SDL_SUL = -3,
}

export interface PointFilter {
  id: string
  mode: 'includeOnly' | 'colour'
  type:
    | 'enb'
    | 'gnb'
    | 'eutraBand'
    | 'nrBand'
    | 'cellNo'
    | 'signalStrength'
    | 'networkType'
  values: number[]
  networkType?: 'GSM' | 'UMTS' | 'CDMA' | 'LTE' | 'NR'
  colour?: string
}

export const $cmMeasurements = atom<CmCsvRow[]>([])

export function setCmMeasurements(points: CmCsvRow[]) {
  $cmMeasurements.set(points)
}

export function addCmMeasurements(points: CmCsvRow[]) {
  const newPoints = [...$cmMeasurements.get(), ...points]
  $cmMeasurements.set(newPoints)
}

export const $numCmMeasurements = computed(
  $cmMeasurements,
  (points) => points.length
)

export const $cellMeasurements = computed(
  $cmMeasurements,
  (points: CmCsvRow[]) =>
    points.map((p: CmCsvRow) => {
      const band = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return earfcnToBand(_p.arfcn)
        } else if (_p.type === 'NR' && Number.isFinite(_p.arfcn)) {
          const bands = nrArfcnToBands(_p.arfcn)
          if (bands.length > 0) {
            return bands[0]
          }
        } else if (_p.type === 'NR' && _p.subtype === 'NSA') {
          return XnbBandValues.NSA // 5G NSA w/o NR-ARFCN
        } else if (_p.type === 'UMTS') {
          const utraBands = uarfcnToBands(_p.arfcn, {
            direction: LinkDirection.Downlink,
          })
          if (utraBands && utraBands.length >= 1) {
            const fddBands = utraBands.filter((b) => typeof b === 'number')
            if (fddBands.length >= 1) {
              return fddBands[0]
            }
          }
        }
        return XnbBandValues.UNKNOWN
      })(p)

      const freqmhz = ((_p: CmCsvRow, _band: number) => {
        if (_p.type === 'LTE') {
          return earfcnToFrequency(_p.arfcn)
        } else if (_p.type === 'NR') {
          return nrArfcnToFrequency(_p.arfcn)
        } else if (_p.type === 'UMTS') {
          const additionalFreq = uarfcnToFrequencyFdd(
            _p.arfcn,
            _band,
            'Additional'
          )
          if (additionalFreq >= 0) {
            return additionalFreq
          }
          return uarfcnToFrequencyFdd(_p.arfcn, _band, 'General')
        }
        return -1
      })(p, band)

      const xnb = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE' && _p.cid !== 0) {
          return _p.cid >> 8
        } else if (_p.type === 'LTE' && _p.cid === 0) {
          if (Number.isFinite(_p.arfcn)) {
            return XnbBandValues.SDL_SUL // SDL/SUL
          }
          return -1
        } else if (_p.type === 'NR' && _p.subtype !== 'NSA') {
          return _p.cid >> 14
        } else if (_p.type === 'NR' && _p.subtype === 'NSA') {
          return XnbBandValues.NSA
        } else if (_p.type === 'UMTS') {
          const utraCellId = _p.cid & 0xffff
          if (_p.mcc === 302 && [610, 220, 880, 500].includes(_p.mnc)) {
            // if carrier is Bell, Telus, Bell-Telus FastRoam, or Videotron
            return utraCellId % 1000
          }
          return Math.floor(utraCellId / 10)
        }
        return -1
      })(p)

      const cellno = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return _p.cid & 0xff
        } else if (_p.type === 'NR') {
          return _p.cid & 0x3fff
        } else if (_p.type === 'UMTS') {
          const utraCellId = _p.cid & 0xffff
          if (_p.mcc === 302 && [610, 220, 880, 500].includes(_p.mnc)) {
            // if carrier is Bell, Telus, Bell-Telus FastRoam, or Videotron
            return Math.floor(utraCellId / 1000)
          }
          return utraCellId % 10
        }
        return -1
      })(p)

      return {
        ...p,
        freqmhz,
        band,
        xnb,
        cellno,
      } as CellMeasurement
    })
)

export const $gnbs = computed($cellMeasurements, (points: CellMeasurement[]) =>
  [
    ...new Set(
      points
        .filter((p: CellMeasurement) => p.type === 'NR')
        .map((p: CellMeasurement) => p.xnb)
    ),
  ].sort()
)

export const $enbs = computed($cellMeasurements, (points: CellMeasurement[]) =>
  [
    ...new Set(
      points
        .filter((p: CellMeasurement) => p.type === 'LTE')
        .map((p: CellMeasurement) => p.xnb)
    ),
  ].sort()
)

export const $nrarfcns = computed(
  $cellMeasurements,
  (points: CellMeasurement[]) =>
    [
      ...new Set(
        points
          .filter((p: CellMeasurement) => p.type === 'NR')
          .map((p: CellMeasurement) => p.arfcn)
      ),
    ].sort()
)

export const $earfcns = computed(
  $cellMeasurements,
  (points: CellMeasurement[]) =>
    [
      ...new Set(
        points
          .filter((p: CellMeasurement) => p.type === 'LTE')
          .map((p: CellMeasurement) => p.arfcn)
      ),
    ].sort()
)

export const $eutraBands = computed($earfcns, (earfcns) =>
  [...new Set(earfcns.map((_e) => earfcnToBand(_e)))].sort((a, b) => a - b)
)

export const $nrBands = computed($nrarfcns, (arfcns) => {
  const allBands = arfcns.map((_a) => {
    const bands = nrArfcnToBands(_a)
    if (bands.includes(65) && bands.includes(66)) {
      return bands.filter((b) => b !== 65)
    }
    return bands
  })

  return [...new Set(allBands.flat())].sort()
})

export const $pointFilters = atom<PointFilter[]>([])

export function addFilter(filter: PointFilter) {
  $pointFilters.set([...$pointFilters.get(), filter])
}

export function removeFilter(id: string) {
  $pointFilters.set($pointFilters.get().filter((f) => f.id !== id))
}

export const $filteredPoints = computed(
  [$cellMeasurements, $pointFilters],
  (cellMeasurements, pointFilters) => {
    if (pointFilters.length < 1) {
      return cellMeasurements
    }

    const filteredPoints = cellMeasurements.filter((cm) => {
      return pointFilters
        .filter((pf) => pf.mode === 'includeOnly')
        .every((pf) => {
          if (pf.type === 'enb') {
            return pf.values.includes(cm.xnb)
          } else if (pf.type === 'gnb') {
            return pf.values.includes(cm.xnb)
          } else if (pf.type === 'eutraBand') {
            return pf.values.includes(cm.band)
          } else if (pf.type === 'nrBand') {
            return pf.values.includes(cm.band)
          } else if (pf.type === 'cellNo') {
            return pf.values.includes(cm.cellno)
          } else if (pf.type === 'signalStrength') {
            return cm.signal >= pf.values[0] && cm.signal <= pf.values[1]
          } else if (pf.type === 'networkType') {
            return !!pf.networkType ? cm.type === pf.networkType : true
          }
          return true
        })
    })

    return filteredPoints
  }
)

export const $numFilteredPoints = computed(
  $filteredPoints,
  (filteredPoints) => filteredPoints.length
)

export const $filteredEnbs = computed($filteredPoints, (filteredPoints) => {
  const enbs = [
    ...new Set(
      filteredPoints.filter((fcm) => fcm.type === 'LTE').map((cm) => cm.xnb)
    ),
  ].sort((a, b) => a - b)

  return enbs
})

export const $filteredGnbs = computed($filteredPoints, (filteredPoints) => {
  const gnbs = [
    ...new Set(
      filteredPoints.filter((fcm) => fcm.type === 'NR').map((cm) => cm.xnb)
    ),
  ].sort((a, b) => a - b)

  return gnbs
})

export const $filteredEutraBands = computed(
  $filteredPoints,
  (filteredPoints) => {
    const eutraBands = [
      ...new Set(
        filteredPoints.filter((fcm) => fcm.type === 'LTE').map((cm) => cm.band)
      ),
    ].sort((a, b) => a - b)

    return eutraBands
  }
)

export const $filteredNrBands = computed($filteredPoints, (filteredPoints) => {
  const nrBands = [
    ...new Set(
      filteredPoints.filter((fcm) => fcm.type === 'NR').map((cm) => cm.band)
    ),
  ].sort((a, b) => a - b)

  return nrBands
})

export const $filteredCellNos = computed($filteredPoints, (filteredPoints) => {
  const cellNos = [...new Set(filteredPoints.map((cm) => cm.cellno))].sort(
    (a, b) => a - b
  )

  return cellNos
})

export const $fitAllPointsOnMapFlag = atom(false)

export function setFitAllPointsOnMapFlag() {
  $fitAllPointsOnMapFlag.set(true)
}

export function clearFitAllPointsOnMapFlag() {
  $fitAllPointsOnMapFlag.set(false)
}

export const $filteredNetworkTypes = computed(
  $filteredPoints,
  (filteredPoints) => {
    const networkTypes = [
      ...new Set(filteredPoints.map((cm) => cm.type)),
    ].sort()

    return networkTypes
  }
)
