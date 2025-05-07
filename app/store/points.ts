import {
  earfcnToBand,
  earfcnToFrequency,
  nrArfcnToFrequency,
  nrArfcnToBands,
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
      const freqmhz = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return earfcnToFrequency(_p.arfcn)
        } else if (_p.type === 'NR') {
          return nrArfcnToFrequency(_p.arfcn)
        }
        return -1
      })(p)

      const band = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return earfcnToBand(_p.arfcn)
        } else if (_p.type === 'NR' && Number.isFinite(_p.arfcn)) {
          const bands = nrArfcnToBands(_p.arfcn)
          if (bands.length > 0) {
            return bands[0]
          }
        } else if (_p.type === 'NR' && _p.subtype === 'NSA') {
          return -2 // 5G NSA w/o NR-ARFCN
        }
        return -1
      })(p)

      const xnb = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE' && _p.cid !== 0) {
          return _p.cid >> 8
        } else if (_p.type === 'LTE' && _p.cid === 0) {
          if (Number.isFinite(_p.arfcn)) {
            return -3 // SDL/SUL
          }
          return -1
        } else if (_p.type === 'NR' && _p.subtype !== 'NSA') {
          return _p.cid >> 14
        } else if (_p.type === 'NR' && _p.subtype === 'NSA') {
          return -2 // 5G NSA
        }
        return -1
      })(p)

      const cellno = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return _p.cid & 0xff
        } else if (_p.type === 'NR') {
          return _p.cid & 0x3fff
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

export interface PointFilter {
  id: string
  mode: 'exclude' | 'colour'
  type: 'enb' | 'gnb' | 'eutraBand' | 'nrBand' | 'cellNo' | 'signalStrength'
  values: number[]
  colour?: string
}

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
        .filter((pf) => pf.mode === 'exclude')
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
