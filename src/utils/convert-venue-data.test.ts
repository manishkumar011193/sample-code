import { convertStorageDataRecords } from './convert-storage-data'

import type { StorageDataRecords, StorageData } from '../types/get-screens-response'

describe('convertStorageDataRecords', () => {
  const sampleData: StorageDataRecords = {
    '1': {
      'state': '32',
      'seat_storage_id': {
        standard: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        input: '',
        display: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
      },
      'Storage.storage_name': {
        standard: 'Amazing Venue Site (SITE SHOW)',
        input: '',
        display: 'Amazing Venue Site (SITE SHOW)',
      },
      'Section.section_id': {
        standard: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        input: '',
        display: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
      },
      'Storage.storage_data3': {
        standard: 'pijwdlly-warehouse',
        input: '',
        display: 'pijwdlly-warehouse',
      },
      'seat_storage_screen_id': {
        standard: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
        input: '',
        display: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
      },
    },
    '2': {
      'state': '32',
      'seat_storage_id': {
        standard: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        input: '',
        display: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
      },
      'Storage.storage_name': {
        standard: 'Amazing Venue Site (SITE SHOW)',
        input: '',
        display: 'Amazing Venue Site (SITE SHOW)',
      },
      'Section.section_id': {
        standard: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        input: '',
        display: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
      },
      'Storage.storage_data3': {
        standard: 'pijwdlly-warehouse',
        input: '',
        display: 'pijwdlly-warehouse',
      },
      'seat_storage_screen_id': {
        standard: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
        input: '',
        display: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
      },
    },
  }

  it('should convert valid storage data records', () => {
    const expected: StorageData[] = [
      {
        storageId: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        storageName: 'Amazing Venue Site (SITE SHOW)',
        sectionId: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        storageSlug: 'pijwdlly-warehouse',
        screenId: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
      },
      {
        storageId: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        storageName: 'Amazing Venue Site (SITE SHOW)',
        sectionId: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        storageSlug: 'pijwdlly-warehouse',
        screenId: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
      },
    ]

    const result = convertStorageDataRecords(sampleData)

    expect(result).toStrictEqual(expected)
  })

  it('should return an empty array for empty storage data records', () => {
    const result = convertStorageDataRecords({})

    expect(result).toStrictEqual([])
  })

  it('should handle storage data records with missing fields', () => {
    const incompleteData: StorageDataRecords = {
      '1': {
        'state': '32',
        'seat_storage_id': {
          standard: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
          input: '',
          display: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        },
        'Storage.storage_name': {
          standard: 'Amazing Venue Site (SITE SHOW)',
          input: '',
          display: 'Amazing Venue Site (SITE SHOW)',
        },
        'Section.section_id': {
          standard: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
          input: '',
          display: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        },
        'Storage.storage_data3': {
          standard: 'pijwdlly-warehouse',
          input: '',
          display: 'pijwdlly-warehouse',
        },
        'seat_storage_screen_id': {
          display: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
          input: '',
          standard: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37',
        },
      },
    }

    const expected: StorageData[] = [
      {
        storageId: 'FCA47275-3028-49A7-B1A0-E5CCF7834332',
        storageName: 'Amazing Venue Site (SITE SHOW)',
        sectionId: 'A2BB1D5A-9077-4D43-B3EE-B809EAB2E0D9',
        storageSlug: 'pijwdlly-warehouse',
        screenId: '0EAA099B-0DBA-4E8B-BAD3-F37188AFCD37', // Missing field should result in undefined
      },
    ]

    const result = convertStorageDataRecords(incompleteData)

    expect(result).toStrictEqual(expected)
  })
})
