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
        } else if (_p.type === 'NR') {
          const bands = nrArfcnToBands(_p.arfcn)
          if (bands.length > 0) {
            return bands[0]
          }
        }
        return -1
      })(p)

      const xnb = ((_p: CmCsvRow) => {
        if (_p.type === 'LTE') {
          return _p.cid >> 8
        } else if (_p.type === 'NR') {
          return _p.cid >> 14
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
  enbs: number[]
  eutraBands: number[]
  nrbands: number[]
}

export const $pointFilter = atom<PointFilter>({
  enbs: [],
  eutraBands: [],
  nrbands: [],
})

export function setSelectedEnbs(enbs: number[]) {
  $pointFilter.set({
    ...$pointFilter.get(),
    enbs: enbs,
  })
}

export const $filteredEnbs = computed($pointFilter, (pf) =>
  [
    ...new Set(
      $cellMeasurements
        .get()
        .filter((cm) =>
          pf.eutraBands.length < 1 || pf.eutraBands.includes(cm.band)
        )
        .map((cm) => cm.xnb)
    ),
  ].sort((a, b) => a - b)
)

export function setSelectedEutraBands(eutraBands: number[]) {
  $pointFilter.set({
    ...$pointFilter.get(),
    eutraBands: eutraBands,
  })
}
