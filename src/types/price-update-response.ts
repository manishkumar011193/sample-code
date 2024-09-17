export interface InventoryUpdateResponseSeat {
  number: string
  inventorySectionId: string
  status: 'pending' | 'success' | 'failed'
  error: string
}

interface InventoryUpdateResponseRow {
  row: string
  seats: InventoryUpdateResponseSeat[]
}

export interface InventoryUpdateResponseSection {
  name: string
  sectionId: string
  rows: InventoryUpdateResponseRow[]
  errors: string[]
}

export interface InventoryUpdateResponse {
  performance: string
  storageSlug: string
  sections: InventoryUpdateResponseSection[]
  toinventoryId: string
  errors: string[]
}
