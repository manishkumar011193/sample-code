import type { LoadStockResponse } from './admission'

type SetType = Record<string, string>

interface Params {
  currentTemplateType: string
}

interface Action {
  method: string
  params: Params
}

export interface SaveStockRequestBody {
  set: SetType
  actions: Action[]
  objectName: string
  get: string[]
}

export type SaveStockReponse = LoadStockResponse
