import React from 'react'
import { useState } from 'react'
import { useStore } from '@nanostores/react'
import {
  $filteredCellNos,
  $filteredEnbs,
  $filteredGnbs,
  $filteredEutraBands,
  $filteredNrBands,
  addFilter,
} from '~/store/points'
import { uuidv4 } from '~/util'

export function FilterModal() {
  const [filteringMode, setFilteringMode] = useState<'includeOnly' | 'colour'>(
    'includeOnly'
  )
  const [filterType, setFilterType] = useState<string>('enb')
  const [filterColour, setFilterColour] = useState<string>('blue')

  const filteredEnbs = useStore($filteredEnbs)
  const filteredGnbs = useStore($filteredGnbs)
  const filteredEutraBands = useStore($filteredEutraBands)
  const filteredNrBands = useStore($filteredNrBands)
  const filteredCellNos = useStore($filteredCellNos)

  const [selectedValues, setSelectedValues] = useState<number[]>()

  const multiSelectDivClassName = 'w-full'
  const multiSelectClassName = 'w-full pl-1 pr-1'

  function handleAdd(event: React.MouseEvent<HTMLButtonElement>): void {
    if (
      filterType &&
      [
        'enb',
        'gnb',
        'eutraBand',
        'nrBand',
        'cellNo',
        'signalStrength',
      ].includes(filterType)
    ) {
      const newFilterValues = selectedValues ? [...selectedValues] : []
      if (filterType === 'signalStrength') {
        // number range sanity check
        if (newFilterValues.length !== 2) {
          return
        }
        if (
          Number.isFinite(newFilterValues[0]) &&
          Number.isFinite(newFilterValues[1]) &&
          newFilterValues[0] > newFilterValues[1]
        ) {
          newFilterValues.reverse()
        }
        if (
          Number.isNaN(newFilterValues[0]) ||
          !Number.isFinite(newFilterValues[0])
        ) {
          newFilterValues[0] = Number.NEGATIVE_INFINITY
        }
        if (
          Number.isNaN(newFilterValues[1]) ||
          !Number.isFinite(newFilterValues[1])
        ) {
          newFilterValues[1] = Number.POSITIVE_INFINITY
        }
        if (
          newFilterValues[0] === Number.NEGATIVE_INFINITY &&
          newFilterValues[1] === Number.POSITIVE_INFINITY
        ) {
          return
        }
      }
      addFilter({
        id: uuidv4(),
        mode: filteringMode,
        type: filterType as
          | 'enb'
          | 'gnb'
          | 'eutraBand'
          | 'nrBand'
          | 'cellNo'
          | 'signalStrength',
        values: newFilterValues,
        colour: filteringMode === 'colour' ? filterColour : undefined,
      })
    }
  }

  return (
    <div>
      <h3>Add filter</h3>
      <div className="w-full mb-1">
        <select
          className="w-full pl-1 pr-1"
          onChange={(e) => {
            setFilterType(e.target.value)
            setSelectedValues(undefined)
          }}
        >
          <option value="enb">eNB (4G)</option>
          <option value="gnb">gNB (5G)</option>
          <option value="eutraBand">4G LTE band</option>
          <option value="nrBand">5G NR band</option>
          <option value="cellNo">Cell number</option>
          <option value="signalStrength">Signal strength</option>
        </select>
      </div>
      {filterType === 'enb' && (
        <div className={multiSelectDivClassName}>
          <select
            className={multiSelectClassName}
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
                {enb === -3 ? 'SDL/SUL' : enb}
              </option>
            ))}
          </select>
        </div>
      )}
      {filterType === 'eutraBand' && (
        <div className={multiSelectDivClassName}>
          <select
            className={multiSelectClassName}
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
        </div>
      )}
      {filterType === 'gnb' && (
        <div className={multiSelectDivClassName}>
          <select
            className={multiSelectClassName}
            multiple
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedValues(
                Array.from(e.target.selectedOptions, (option) =>
                  Number.parseInt(option.value)
                )
              )
            }}
          >
            {filteredGnbs.map((gnb) => (
              <option key={gnb} value={gnb}>
                {gnb === -2 ? 'NSA' : gnb}
              </option>
            ))}
          </select>
        </div>
      )}
      {filterType === 'nrBand' && (
        <div className={multiSelectDivClassName}>
          <select
            className={multiSelectClassName}
            multiple
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedValues(
                Array.from(e.target.selectedOptions, (option) =>
                  Number.parseInt(option.value)
                )
              )
            }}
          >
            {filteredNrBands.map((nrBand) => (
              <option key={nrBand} value={nrBand}>
                {nrBand === -2 ? 'NSA' : nrBand}
              </option>
            ))}
          </select>
        </div>
      )}
      {filterType === 'cellNo' && (
        <div className={multiSelectDivClassName}>
          <select
            className={multiSelectClassName}
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
        </div>
      )}
      {filterType === 'signalStrength' && (
        <div className="flex gap-2">
          Signal range
          <span>[</span>
          <input
            type="number"
            name="signalMin"
            className="w-20"
            onChange={(e) =>
              setSelectedValues([
                Number.parseInt(e.target.value),
                selectedValues?.[1] ?? -Number.POSITIVE_INFINITY,
              ])
            }
          />
          <span>...</span>
          <input
            type="number"
            name="signalMax"
            className="w-20"
            onChange={(e) =>
              setSelectedValues([
                selectedValues?.[0] ?? -Number.NEGATIVE_INFINITY,
                Number.parseInt(e.target.value),
              ])
            }
          />
          <span>]</span>
        </div>
      )}
      <div className={multiSelectDivClassName}>
        <select
          className="w-1/2"
          onChange={(e) =>
            setFilteringMode(e.target.value as 'includeOnly' | 'colour')
          }
          defaultValue={'includeOnly'}
        >
          <option value="includeOnly">Include only</option>
          <option value="colour">Colour</option>
        </select>
        {filteringMode === 'colour' && (
          <select
            className="w-1/2"
            onChange={(e) => setFilterColour(e.target.value)}
          >
            <option value="blue">Blue</option>
            <option value="navy">Navy</option>
            <option value="aqua">Aqua</option>
            <option value="purple">Purple</option>
            <option value="deeppink">Deep pink</option>
            <option value="fuchsia">Fuchsia</option>
            <option value="orange">Orange</option>
            <option value="white">White</option>
            <option value="gray">Gray</option>
            <option value="darkgray">Dark gray</option>
            <option value="silver">Silver</option>
          </select>
        )}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="block w-full text-sm
                  dark:bg-violet-50 dark:text-violet-700
                  mt-2 mr-4 py-2 px-4
                  rounded-full border-0
                  text-sm font-semibold
                  bg-violet-50 text-violet-700
                  hover:bg-violet-100"
      >
        Add
      </button>
    </div>
  )
}
