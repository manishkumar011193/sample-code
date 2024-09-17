import {
  filterScreensBySection,
  getAllSeatIdsInSection,
  filterStock,
} from './update-seat-inventorys'

import type { StorageData } from '../types/get-screens-response'
import type { InventoryUpdateRequestSection } from '../types/inventory-update-request'
import type { AdmissionData } from '../types/admission'
import type { InventoryUpdateResponse } from '../types/inventory-update-response'

describe('update-seat-inventorys utility functions', () => {
  describe('filterScreensBySection', () => {
    const allScreens: StorageData[] = [
      {
        screenId: 'screen1',
        sectionId: 'section1',
        storageId: 'storage1',
        storageName: 'storage1',
        storageSlug: 'storage1',
      },
      {
        screenId: 'screen2',
        sectionId: 'section2',
        storageId: 'storage2',
        storageName: 'storage2',
        storageSlug: 'storage2',
      },
      {
        screenId: 'screen3',
        sectionId: 'section1',
        storageId: 'storage3',
        storageName: 'storage3',
        storageSlug: 'storage3',
      },
    ]

    it('should filter screens by section ID', () => {
      const result = filterScreensBySection('section1', allScreens)

      expect(result).toStrictEqual([
        {
          screenId: 'screen1',
          sectionId: 'section1',
          storageId: 'storage1',
          storageName: 'storage1',
          storageSlug: 'storage1',
        },
        {
          screenId: 'screen3',
          sectionId: 'section1',
          storageId: 'storage3',
          storageName: 'storage3',
          storageSlug: 'storage3',
        },
      ])
    })

    it('should return an empty array if no screens match the section ID', () => {
      const result = filterScreensBySection('section3', allScreens)

      expect(result).toStrictEqual([])
    })
  })

  describe('getAllSeatIdsInSection', () => {
    const section: InventoryUpdateRequestSection = {
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
        {
          row: 'J',
          seats: [
            { number: '10', inventorySectionId: 'GUID-SEAT-J10' },
            { number: '11', inventorySectionId: 'GUID-SEAT-J11' },
          ],
        },
      ],
    }

    it('should return all seat IDs in the section', () => {
      const result = getAllSeatIdsInSection(section)

      expect(result).toStrictEqual([
        'GUID-SEAT-H8',
        'GUID-SEAT-H9',
        'GUID-SEAT-J10',
        'GUID-SEAT-J11',
      ])
    })

    it('should return an empty array if there are no seats in the section', () => {
      const emptySection: InventoryUpdateRequestSection = {
        name: 'Empty Section',
        sectionId: 'empty-section-guid',
        rows: [],
      }
      const result = getAllSeatIdsInSection(emptySection)

      expect(result).toStrictEqual([])
    })
  })

  describe('filterStock', () => {
    const allSeatIdsInSection = [
      '4557690C-BD47-42AF-AF71-A6E6DDD4DEE2',
      '106881A0-07AD-4C38-8866-2719FFBC7C19',
    ]
    const allStock: AdmissionData[] = [
      {
        inventorySectionId: '4557690C-BD47-42AF-AF71-A6E6DDD4DEE2',
        description: 'Stalls A 6',
        inventoryValueId: '4F531AAE-05BC-4DFF-B30A-CAF22C0278FA',
        status: 'A',
      },
      {
        inventorySectionId: '106881A0-07AD-4C38-8866-2719FFBC7C19',
        description: 'Dress Circle K 4',
        inventoryValueId: '2D717651-148F-445C-AB9A-4E4D7B814ECB',
        status: 'S',
      },
      {
        inventorySectionId: 'GUID-SEAT-J11',
        description: 'Stalls B 7',
        inventoryValueId: '3D717651-148F-445C-AB9A-4E4D7B814ECB',
        status: 'S',
      },
    ]
    const inventoryUpdateResponse: InventoryUpdateResponse = {
      errors: [],
      performance: 'performance-guid',
      toinventoryId: 'inventory-zone-guid',
      storageSlug: 'storage-slug',
      sections: [
        {
          name: 'Daily Goods',
          sectionId: 'section-guid',
          rows: [
            {
              row: 'H',

              seats: [
                {
                  number: '0',
                  inventorySectionId: '4557690C-BD47-42AF-AF71-A6E6DDD4DEE2',
                  status: 'pending',
                  error: '',
                },
                {
                  number: '10',
                  inventorySectionId: '106881A0-07AD-4C38-8866-2719FFBC7C19',
                  status: 'pending',
                  error: '',
                },
              ],
            },
          ],
          errors: [],
        },
      ],
    }

    it('should filter stock by seat IDs in the section and exclude tracked seats', () => {
      const result = filterStock(
        allSeatIdsInSection,
        allStock,
        inventoryUpdateResponse
      )

      expect(result).toStrictEqual([
        [
          {
            inventorySectionId: '106881A0-07AD-4C38-8866-2719FFBC7C19',
            description: 'Dress Circle K 4',
            inventoryValueId: '2D717651-148F-445C-AB9A-4E4D7B814ECB',
            status: 'S',
          },
        ],
        [
          {
            inventorySectionId: '4557690C-BD47-42AF-AF71-A6E6DDD4DEE2',
            description: 'Stalls A 6',
            inventoryValueId: '4F531AAE-05BC-4DFF-B30A-CAF22C0278FA',
            status: 'A',
          },
        ],
      ])
    })

    it('should return an empty array if no stock match the seat IDs in the section', () => {
      const result = filterStock(
        ['GUID-SEAT-J11'],
        allStock,
        inventoryUpdateResponse
      )

      expect(result).toStrictEqual([
        [
          {
            inventorySectionId: 'GUID-SEAT-J11',
            description: 'Stalls B 7',
            inventoryValueId: '3D717651-148F-445C-AB9A-4E4D7B814ECB',
            status: 'S',
          },
        ],
        [],
      ])
    })
  })
})
