import { INVStatus } from '../types/inventory-status'

import { authenticate, logout } from './account'
import { callAvApi } from './base'
import { INVErrorCodes } from './inv-error-codes'

import type { ApiClientConfig, Cookies } from '../types/config'
import type { INVResponse } from '../types/inventory-responses'
import type {
  AuthenticateRequest,
  AuthenticateApiResponse,
} from '../types/responses'

jest.mock('./base')

const mockCallAvApi = callAvApi as jest.MockedFunction<typeof callAvApi>

const serverLoggerMock = {
  debug: jest.fn(),
  error: jest.fn(),
}

jest.mock('@inventory-service/server-logger-library', () => ({
  serverLogger: {
    getInstance: () => serverLoggerMock,
  },
}))

describe('authenticate', () => {
  let config: ApiClientConfig
  let request: AuthenticateRequest

  beforeEach(() => {
    config = {
      apiKey: 'myApiKey',
      apiUrl: 'https://api.example.com',
      password: 'myPassword',
      timeZoneLocation: 'Europe/London',
      username: 'myUsername',
    } as ApiClientConfig
    request = {
      email: 'test@example.com',
      password: 'password123',
      role: 'UserRole',
    }
  })

  it('should return 200 and session on successful authentication', async () => {
    const mockResponse: INVResponse<AuthenticateApiResponse> = {
      cookie: {
        cookieName: 'cookieData',
      },
      response: {
        session: 'mySession',
        version: '7.67.8',
        errorCode: undefined,
        message: 'Success',
        exception: undefined,
      },
    }
    mockCallAvApi.mockResolvedValue(mockResponse)

    const result = await authenticate(config, request)

    expect(result).toStrictEqual({
      statusCode: 200,
      cookie: {
        cookieName: 'cookieData',
      },
      session: 'mySession',
    })
  })

  it('should handle response contains known INV exception', async () => {
    const mockResponse: INVResponse<AuthenticateApiResponse> = {
      cookie: {
        cookieName: 'cookieData',
      },
      response: {
        session: 'expiredSession',
        version: '7.67.8',
        errorCode: '123',
        message: 'Failed',
        exception: {
          number: 2001,
          message: 'An error occurred',
          severity: 'ERROR',
        },
      },
    }
    mockCallAvApi.mockResolvedValue(mockResponse)

    const result = await authenticate(config, request)
    const avErrorCode =
      INVErrorCodes[mockResponse.response.exception?.number ?? 0]

    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      {
        email: request.email,
        response: mockResponse.response,
        code: avErrorCode?.code,
        message: avErrorCode?.message,
      },
      'INV Error authenticating user'
    )
    expect(result).toStrictEqual({
      statusCode: avErrorCode?.code,
      code: avErrorCode?.message,
      session: mockResponse.response.session,
    })
  })

  it('should handle response contains unknown INV exception', async () => {
    const mockResponse: INVResponse<AuthenticateApiResponse> = {
      cookie: {
        cookieName: 'cookieData',
      },
      response: {
        session: 'invalidSession',
        version: '7.67.8',
        errorCode: undefined,
        message: 'Failed',
        exception: {
          number: 9821,
          message: 'An error occurred',
          severity: 'ERROR',
        },
      },
    }
    mockCallAvApi.mockResolvedValue(mockResponse)

    const result = await authenticate(config, request)

    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      {
        email: request.email,
        response: mockResponse.response,
      },
      'Error authenticating user'
    )
    expect(result).toStrictEqual({
      statusCode: 500,
      code: INVStatus.Error,
    })
  })

  it('should handle when response contains errorCode', async () => {
    const mockResponse: INVResponse<AuthenticateApiResponse> = {
      cookie: {
        cookieName: 'cookieData',
      },
      response: {
        session: 'mySession',
        version: '7.67.8',
        errorCode: 'CONNECTION_ERROR',
        message: 'Success',
        exception: undefined,
      },
    }
    mockCallAvApi.mockResolvedValue(mockResponse)

    const result = await authenticate(config, request)

    expect(serverLoggerMock.error).toHaveBeenCalled()
    expect(result).toStrictEqual({
      statusCode: 500,
      code: INVStatus.Error,
    })
  })

  it('should handle exceptions during API call', async () => {
    mockCallAvApi.mockRejectedValue(new Error('API call failed'))

    const result = await authenticate(config, request)

    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      {
        email: request.email,
        error: new Error('API call failed'),
      },
      'Error validating user credentials'
    )
    expect(result).toStrictEqual({
      statusCode: 500,
      code: INVStatus.Error,
    })
  })
})

describe('logout', () => {
  let config: ApiClientConfig
  let cookies: Cookies

  beforeEach(() => {
    config = {} as ApiClientConfig
    cookies = {
      cookieName: 'cookieData',
    } as Cookies
  })

  it('should return true on successful logout', async () => {
    const sessionInfo = {
      version: '7.67.8',
      session: '0E745FE8-51B1-4BC8-9C82-31162B526FE4',
    }
    const mockedResponse = {
      cookie: {
        session: '',
      },
      response: sessionInfo,
    }
    mockCallAvApi.mockResolvedValue(mockedResponse)

    const result = await logout(config, cookies)

    expect(result).toStrictEqual(mockedResponse.response)
  })

  it('logout should fail beacuse cookie is not reset', async () => {
    const sessionInfo = {
      version: '7.67.8',
      session: '0E745FE8-51B1-4BC8-9C82-31162B526FE4',
    }
    const mockedResponse = {
      cookie: {
        session: '0E745FE8-51B1-4BC8-9C82-31162B526FE4',
      },
      response: sessionInfo,
    }
    mockCallAvApi.mockResolvedValue(mockedResponse)

    const result = await logout(config, cookies)

    expect(result).toBeNull()
  })

  it('should log error on failed logout', async () => {
    mockCallAvApi.mockRejectedValue(new Error('Logout failed'))

    const result = await logout(config, cookies)

    expect(serverLoggerMock.error).toHaveBeenCalled()
    expect(result).toBeNull()
  })
})
