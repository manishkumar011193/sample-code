import { INVStatus } from '../types/inventory-status'

interface INVError {
  code: number
  message: string
}

type INVErrorMap = Record<number, INVError>

export const INVErrorCodes: INVErrorMap = {
  2001: {
    code: 401,
    message: INVStatus.Invalid,
  },
  2004: {
    code: 423,
    message: INVStatus.Locked,
  },
  2002: {
    code: 401,
    message: INVStatus.Expired,
  },
  99: {
    code: 401,
    message: INVStatus.SessionExpired,
  },
  5274: {
    code: 401,
    message: INVStatus.Invalid,
  },
  5005: {
    code: 401,
    message: INVStatus.Invalid,
  },
}
