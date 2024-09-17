interface Seat {
  number: string
  inventorySectionId: string
}

interface Row {
  row: string
  seats: Seat[]
}

export interface InventoryUpdateRequestSection {
  name: string
  sectionId: string
  rows: Row[]
}

export interface InventoryUpdateRequest {
  performance: string
  storageSlug: string
  sections: InventoryUpdateRequestSection[]
  toinventoryId: string
}
