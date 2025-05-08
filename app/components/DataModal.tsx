import { useState } from 'react'
import { useStore } from '@nanostores/react'
import Papa from 'papaparse'

import {
  $filteredCellNos,
  $filteredEnbs,
  $filteredEutraBands,
  addCmMeasurements,
  type CmCsvRow,
} from '~/store/points'
import { FilterModal } from './FilterModal'
import { FiltersList } from './FiltersList'
import { NumPointsCard } from './NumPointsCard'
import { EutraCard } from './EutraCard'
import { NrCard } from './NrCard'
import { disabledMultiSelectClassName } from '../style/common'

export default function DataModal({ className }: { className?: string }) {
  const [ituGen, setItuGen] = useState<'4g' | '5g'>('4g')

  function onParseComplete({
    filename,
    data,
  }: {
    filename: string
    data: string[][]
  }) {
    console.log(`filename: ${filename}; data.length: ${data.length}`)

    const processed = data
      .filter((r) => !isNaN(parseInt(r[0])))
      .map((r) => {
        return {
          lat: parseFloat(r[0]),
          lng: parseFloat(r[1]),
          alt: parseInt(r[2]),
          mcc: parseInt(r[3]),
          mnc: parseInt(r[4]),
          lac: parseInt(r[5]),
          cid: parseInt(r[6]),
          signal: parseInt(r[7]),
          type: r[8],
          subtype: r[9],
          arfcn: parseInt(r[10]),
          pci: parseInt(r[11]),
        } as CmCsvRow
      })

    addCmMeasurements(processed)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return
    }
    for (let i = 0; i < event.target.files.length; i++) {
      const f = event.target.files[i]
      Papa.parse(f, {
        complete: (result) => {
          if (result.errors) {
            console.log(`csv parse error: ${result.errors}`)
          }
          // console.log(`parse complete: ${typeof result.data[0][0]}`)
          onParseComplete({
            filename: f.name,
            data: result.data as string[][],
          })
        },
        header: false,
        dynamicTyping: true,
      })
    }
  }

  function handleItuGenChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (['4g', '5g'].includes(event.target.value)) {
      setItuGen(event.target.value as '4g' | '5g')
    }
  }

  const filteredEnbs = useStore($filteredEnbs)
  const filteredEutraBands = useStore($filteredEutraBands)
  const filteredCellNos = useStore($filteredCellNos)
  return (
    <div className={className}>
      <div className="h-auto">
        <form>
          <div className="mb-2">
            <h3>Add CellMapper CSV trace</h3>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm dark:text-gray-300
                    mt-2 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100"
            />
          </div>
          <div className="mb-1">
            <input
              type="radio"
              name="ituGen"
              id="ituGen4g"
              value="4g"
              onChange={handleItuGenChange}
              checked={ituGen === '4g'}
            />
            <label htmlFor="ituGen4g" className="ml-1 mr-2">
              4G LTE
            </label>
            <input
              type="radio"
              name="ituGen"
              id="ituGen5g"
              value="5g"
              onChange={handleItuGenChange}
              checked={ituGen === '5g'}
            />
            <label htmlFor="ituGen5g" className="ml-1">
              5G NR
            </label>
          </div>
          {ituGen === '4g' && <EutraCard />}
          {ituGen === '5g' && <NrCard />}
          <div>
            <h3>Cell numbers</h3>
            <select multiple disabled className={disabledMultiSelectClassName}>
              {filteredCellNos.map((cellNo) => (
                <option key={cellNo} value={cellNo}>
                  {cellNo}
                </option>
              ))}
            </select>
          </div>
          <NumPointsCard />
          <hr className="my-1" />
          <FiltersList />
          <hr className="my-1" />
          <FilterModal />
        </form>
      </div>
    </div>
  )
}
