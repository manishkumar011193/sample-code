import type { AdmissionData, AdmissionRecords } from '../types/admission'

function parseInnerItem(item: string | string[] | undefined): string {
  if (Array.isArray(item)) {
    return item[0] ?? ''
  }
  return item ?? ''
}

export function convertAdmissionRecords(
  stock: AdmissionRecords
): AdmissionData[] {
  return Object.values(stock).map((item) => ({
    inventorySectionId: parseInnerItem(item?.seat_id?.standard),
    description: parseInnerItem(item.description?.standard),
    inventoryValueId: parseInnerItem(item.inventory_value_id?.standard),
    status: parseInnerItem(item.status?.standard),
  }))
}
