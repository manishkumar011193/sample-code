import type { StorageData, StorageDataRecords } from '../types/get-screens-response'

export function convertStorageDataRecords(
  vanueDataRecords: StorageDataRecords
): StorageData[] {
  return Object.values(vanueDataRecords).map((item) => ({
    storageId: item?.seat_storage_id?.standard ?? '',
    storageName: item['Storage.storage_name']?.standard ?? '',
    sectionId: item['Section.section_id']?.standard ?? '',
    storageSlug: item['Storage.storage_data3']?.standard ?? '',
    screenId: item?.seat_storage_screen_id?.standard ?? '',
  }))
}
