interface InnerItem {
  standard?: string | string[]
  input?: string | string[]
  display?: string | string[]
}

interface Admission {
  state?: string
  admission_id?: InnerItem
  fill_value?: InnerItem
  hold_value_id?: InnerItem
  inventory_value_id?: InnerItem
  fill_value_same?: InnerItem
  hold_value_id_same?: InnerItem
  inventory_value_id_same?: InnerItem
  holds_id?: InnerItem
  x_pos?: InnerItem
  y_pos?: InnerItem
  status?: InnerItem
  description?: InnerItem
  seat_id?: InnerItem
  screen_id?: InnerItem
  order_id?: InnerItem
  inventory_type?: InnerItem
  is_admission?: InnerItem
  acquisition_cost?: InnerItem
  acquisition_date?: InnerItem
  inventory_status?: InnerItem
  supplier?: InnerItem
  datetime_1?: InnerItem
  datetime_2?: InnerItem
  amount_1?: InnerItem
  amount_2?: InnerItem
  data_1?: InnerItem
  data_2?: InnerItem
  data_3?: InnerItem
  data_4?: InnerItem
  data_5?: InnerItem
  data_6?: InnerItem
  data_7?: InnerItem
  data_8?: InnerItem
  data_9?: InnerItem
  reference_number?: InnerItem
  message?: InnerItem
  image?: InnerItem
  image_alt_text?: InnerItem
}

export type AdmissionRecords = Record<string, Admission>

interface Data {
  stock_collection: AdmissionRecords
}

export interface LoadStockResponse {
  data: Data
}

export interface AdmissionData {
  inventorySectionId: string
  status: string
  description: string
  inventoryValueId: string
}
