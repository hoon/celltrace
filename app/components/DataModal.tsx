import { useState } from 'react'
import Papa from 'papaparse'

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

export default function DataModal({
  className,
  onCsvData,
}: {
  className?: string
  onCsvData: ({
    filename,
    data,
  }: {
    filename: string
    data: CmCsvRow[]
  }) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
        // console.log(r)
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

    onCsvData({
      filename,
      data: processed,
    })
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
      </form>
    </div>
  )
}
