import type { Cookies } from './config'

export interface AuthenticateRequest {
  email: string
  password: string
  role?: string
}

export interface AuthenticateResponse {
  cookie?: Cookies
  session?: string
  statusCode: number
  code?: string
  token?: string
}

export interface AuthenticateApiResponse {
  version: string
  session: string
}
