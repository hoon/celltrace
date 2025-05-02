import React from 'react'
import { useState } from 'react'
import { useStore } from '@nanostores/react'
import { $filteredCellNos, $filteredEnbs, $filteredEutraBands, addFilter } from '~/store/points'
import { uuidv4 } from '~/util'

export function FilterModal() {
  const [filterType, setFilterType] = useState<string>('enb')

  const filteredEnbs = useStore($filteredEnbs)
  const filteredEutraBands = useStore($filteredEutraBands)
  const filteredCellNos = useStore($filteredCellNos)

  const [selectedValues, setSelectedValues] = useState<number[]>()

  function handleAdd(event: React.MouseEvent<HTMLButtonElement>): void {
    if (
      filterType &&
      ['enb', 'gnb', 'eutraBand', 'nrBand', 'cellNo'].includes(filterType)
    ) {
      addFilter({
        id: uuidv4(),
        type: filterType as 'enb' | 'gnb' | 'eutraBand' | 'nrBand' | 'cellNo',
        values: selectedValues ?? [],
      })
    }
  }

  return (
    <div>
      <h3>Add filter</h3>
      <select onChange={(e) => setFilterType(e.target.value)}>
        <option value="enb">eNB (4G)</option>
        <option value="gnb">gNB (5G)</option>
        <option value="eutraBand">4G E-UTRA (LTE) band</option>
        <option value="nrBand">5G 5G NR NR band</option>
        <option value="cellNo">Cell number</option>
      </select>
      {filterType === 'enb' && (
        <select
          multiple
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedValues(
              Array.from(e.target.selectedOptions, (option) =>
                Number.parseInt(option.value)
              )
            )
          }}
        >
          {filteredEnbs.map((enb) => (
            <option key={enb} value={enb}>
              {enb}
            </option>
          ))}
        </select>
      )}
      {filterType === 'eutraBand' && (
        <select
          multiple
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedValues(
              Array.from(e.target.selectedOptions, (option) =>
                Number.parseInt(option.value)
              )
            )
          }}
        >
          {filteredEutraBands.map((eutraBand) => (
            <option key={eutraBand} value={eutraBand}>
              {eutraBand}
            </option>
          ))}
        </select>
      )}
      {filterType === 'cellNo' && (
        <select
          multiple
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedValues(
              Array.from(e.target.selectedOptions, (option) =>
                Number.parseInt(option.value)
              )
            )
          }}
        >
          {filteredCellNos.map((cellNo) => (
            <option key={cellNo} value={cellNo}>
              {cellNo}
            </option>
          ))}
        </select>
      )}
      <button type="button" onClick={handleAdd}>
        Add
      </button>
    </div>
  )
}
