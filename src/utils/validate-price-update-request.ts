import { z } from 'zod'

const SeatSchema = z.object({
  number: z.string(),
  inventorySectionId: z.string(),
})

const RowSchema = z.object({
  row: z.string(),
  seats: z.array(SeatSchema),
})

const InventoryUpdateSectionSchema = z.object({
  name: z.string(),
  sectionId: z.string(),
  rows: z.array(RowSchema),
})

const InventoryUpdateSchema = z.object({
  performance: z.string(),
  storageSlug: z.string(),
  sections: z.array(InventoryUpdateSectionSchema),
  toinventoryId: z.string(),
})

export const validateInventoryUpdateRequest = <T>(data: unknown) => {
  const result = InventoryUpdateSchema.safeParse(data)

  if (!result.success) {
    throw new Error('Invalid InventoryUpdateRequest data')
  } else {
    return result.data as T
  }
}
