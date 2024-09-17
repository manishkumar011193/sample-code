import type { StorageDataRecords } from '../types/get-screens-response'

export const removeStateKey = (result: StorageDataRecords) => {
  delete result?.state
}
