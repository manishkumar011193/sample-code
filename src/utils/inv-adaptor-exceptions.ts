import { CustomError } from 'ts-custom-error'

export class NamedCustomError extends CustomError {
  constructor(message: string, errorName: string) {
    super(message)

    Object.defineProperty(this, 'name', {
      value: errorName,
    })
  }
}

export class AvAdaptorError extends NamedCustomError {
  readonly statusCode!: number

  constructor(message: string, errorName: string) {
    super(message, errorName)
  }
}

export class AvAdaptorInternalServerError extends AvAdaptorError {
  override readonly statusCode = 500
  static errorName = 'AvAdaptorInternalServerError'

  constructor(msg: string) {
    super(msg, AvAdaptorInternalServerError.errorName)
  }
}

export class AvAdaptorTimeoutError extends AvAdaptorError {
  override readonly statusCode = 500
  static errorName = 'AvAdaptorTimeoutError'

  constructor(msg: string) {
    super(msg, AvAdaptorTimeoutError.errorName)
  }
}

export class AvAdapterRequestError extends AvAdaptorError {
  override readonly statusCode = 400
  static errorName = 'AvAdapterRequestError'

  constructor(msg: string) {
    super(msg, AvAdapterRequestError.errorName)
  }
}

export class AvAdaptorUnAuthorizedError extends AvAdaptorError {
  override readonly statusCode = 401
  static errorName = 'AvAdaptorUnAuthorizedError'

  constructor(msg: string) {
    super(msg, AvAdaptorUnAuthorizedError.errorName)
  }
}

export class HttpError extends NamedCustomError {
  statusCode: number
  static errorName = 'HandlerInvocationError'

  constructor(msg: string, code: number) {
    super(msg, HttpError.errorName)
    this.statusCode = code
  }
}
