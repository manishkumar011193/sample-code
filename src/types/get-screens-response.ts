export interface StorageData {
  storageId: string
  storageName: string
  sectionId: string
  storageSlug: string
  screenId: string
}

interface InnerItem {
  standard?: string
  input?: string
  display?: string
}

export interface StorageDataUnformatted {
  'state'?: string
  'seat_storage_id'?: InnerItem
  'Storage.storage_name'?: InnerItem
  'Section.section_id'?: InnerItem
  'Storage.storage_data3'?: InnerItem
  'seat_storage_screen_id'?: InnerItem
}

export type StorageDataRecords = Record<string, StorageDataUnformatted>

interface Data {
  Result: StorageDataRecords
}

export interface StorageResponse {
  version: string
  session: string
  data: Data
}
