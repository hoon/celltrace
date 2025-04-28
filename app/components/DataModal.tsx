import Papa from 'papaparse'
import {
  $enbs,
  $eutraBands,
  $filteredEnbs,
  $nrBands,
  $pointFilter,
  addCmMeasurements,
  setSelectedEnbs,
  setSelectedEutraBands,
  type CmCsvRow,
} from '~/store/points'
import { useStore } from '@nanostores/react'

export default function DataModal({ className }: { className?: string }) {
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

  function handleEnbChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedEnbs = Array.from(event.target.selectedOptions, (option) =>
      Number.parseInt(option.value)
    )
    setSelectedEnbs(selectedEnbs)
  }

  function handleEutraBandChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedEutraBands = Array.from(event.target.selectedOptions, (option) =>
      Number.parseInt(option.value)
    )
    setSelectedEutraBands(selectedEutraBands)
  }

  const enbs = useStore($enbs)
  // const filteredEnbs = useStore($filteredEnbs)
  const eutrabands = useStore($eutraBands)
  const nrbands = useStore($nrBands)
  const pointFilter = useStore($pointFilter)
  return (
    <div className={className}>
      <form>
        <div>
          <h3>Add CellMapper CSV trace</h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-300
                    mt-2 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100"
          />
        </div>
        <div>
          <h3>Select eNB</h3>
          <select
            multiple
            onChange={handleEnbChange}
            className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {enbs.map((enb) => (
              <option key={enb} value={enb}>
                {enb}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3>Select E-UTRA (4G) band</h3>
          <select
            multiple
            onChange={handleEutraBandChange}
            className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {eutrabands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h3>Select NR band</h3>
          <select
            multiple
            className="block w-full text-sm mt-2 rounded-sm border-0 font-semibold
                bg-violet-50 text-violet-700 py-2 px-4 hover:bg-violet-100
                focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {nrbands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  )
}
