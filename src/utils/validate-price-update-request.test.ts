import { validateInventoryUpdateRequest } from './validate-inventory-update-request'

describe('validatePerformance', () => {
  const validInventoryUpdateRequestData = {
    performance: 'performanceId',
    storageSlug: 'storage-slug',
    sections: [
      {
        name: 'Daily Goods',
        sectionId: 'section-guid',
        rows: [
          {
            row: 'H',
            seats: [
              { number: '8', inventorySectionId: 'GUID-SEAT-H8' },
              { number: '9', inventorySectionId: 'GUID-SEAT-H9' },
            ],
          },
        ],
      },
    ],
    toinventoryId: 'PriceBandGUID',
  }

  it('should validate and return valid performance data', () => {
    const result = validateInventoryUpdateRequest<
      typeof validInventoryUpdateRequestData
    >(validInventoryUpdateRequestData)

    expect(result).toStrictEqual(validInventoryUpdateRequestData)
  })

  it('should throw an error for invalid performance data', () => {
    const invalidInventoryUpdateRequestData = {
      performance: 'performanceId',
      storageSlug: 'storage-slug',
      sections: 'invalid-sections', // Invalid type
      toinventoryId: 'PriceBandGUID',
    }

    expect(() =>
      validateInventoryUpdateRequest<typeof invalidInventoryUpdateRequestData>(
        invalidInventoryUpdateRequestData
      )
    ).toThrow('Invalid InventoryUpdateRequest data')
  })

  it('should throw an error for missing required fields', () => {
    const missingFieldsData = {
      performance: 'performanceId',
      storageSlug: 'storage-slug',
      sections: [
        {
          name: 'Daily Goods',
          sectionId: 'section-guid',
          rows: [
            {
              row: 'H',
              seats: [
                { number: '8', inventorySectionId: 'GUID-SEAT-H8' },
                { number: '9', inventorySectionId: 'GUID-SEAT-H9' },
              ],
            },
          ],
        },
      ],
      // Missing toinventoryId
    }

    expect(() =>
      validateInventoryUpdateRequest<typeof missingFieldsData>(missingFieldsData)
    ).toThrow('Invalid InventoryUpdateRequest data')
  })
})
