import {
  stockMap,
  sampleResultForStockMap,
} from '../___mocks___/stock'

import { convertAdmissionRecords } from './convert-stock-data'

import type { AdmissionData, AdmissionRecords } from '../types/admission'

describe('convertAdmissionRecords', () => {
  const mockStock: AdmissionRecords = stockMap

  it('should convert admission records correctly', () => {
    const expectedOutput: AdmissionData[] = sampleResultForStockMap

    const result = convertAdmissionRecords(mockStock)

    expect(result).toStrictEqual(expectedOutput)
  })

  it('should handle empty input', () => {
    const result = convertAdmissionRecords({})

    expect(result).toStrictEqual([])
  })

  it('should handle missing fields gracefully', () => {
    const incompleteStock: AdmissionRecords = {
      'C7552645-9FB0-4B90-8787-ECBA6CD63DD8': {
        seat_id: { standard: 'C7552645-9FB0-4B90-8787-ECBA6CD63DD8' },
      },
    }

    const expectedOutput: AdmissionData[] = [
      {
        inventorySectionId: 'C7552645-9FB0-4B90-8787-ECBA6CD63DD8',
        description: '',
        inventoryValueId: '',
        status: '',
      },
    ]

    const result = convertAdmissionRecords(incompleteStock)

    expect(result).toStrictEqual(expectedOutput)
  })
})
