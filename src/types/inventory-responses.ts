import type { Cookies } from './config'

interface Return {
  return?: {
    method: string
    message: string
  }[]
}

export interface SessionInfo {
  version?: string
  session?: string
}

export interface Exception {
  exception?: {
    type?: string
    severity: string
    number: number
    message: string
    context?: string
  }
}

export interface INVResponseInfoAndError extends SessionInfo, Exception, Return {
  errorCode?: string
  message?: string
}

export type AllResponse<Data> = Data & INVResponseInfoAndError

export interface INVResponse<Data> {
  cookie: Cookies
  response: Data & INVResponseInfoAndError
}
