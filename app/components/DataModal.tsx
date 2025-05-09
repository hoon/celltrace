import { useState } from 'react'
import { useStore } from '@nanostores/react'
import Papa from 'papaparse'

import {
  $filteredCellNos,
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
  const [loading, setLoading] = useState(false)
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
    setLoading(false)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return
    }
    setLoading(true)
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

  const filteredCellNos = useStore($filteredCellNos)
  return (
    <div className={className}>
      <div className="h-auto">
        <form>
          <div className="mb-2">
            <h3 className="mb-1">Add CellMapper CSV trace</h3>
            <div className="flex items-center space-x-4">
              <div>
                <label
                  className="block cursor-pointer bg-violet-100 rounded-full 
              py-2 px-4 w-fit text-sm font-semibold
              text-violet-700 hover:bg-violet-100"
                >
                  Choose a file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>
              {loading && <span>Loading...</span>}
            </div>
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
