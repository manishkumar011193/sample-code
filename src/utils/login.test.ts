import {
  AvAdaptorInternalServerError,
  AvAdaptorUnAuthorizedError,
} from './inv-adaptor-exceptions'

import type * as setCookie from 'set-cookie-parser'

const serverLoggerMock = {
  debug: jest.fn(),
  error: jest.fn(),
}

const authenticateMock = jest.fn()

describe('main', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV // Restore old environment
  })

  jest.mock('./account', () => {
    return {
      authenticate: authenticateMock,
    }
  })

  jest.mock('@inventory-service/server-logger-library', () => ({
    serverLogger: {
      getInstance: () => serverLoggerMock,
    },
  }))

  it('should authenticate successfully', async () => {
    const { login } = await import('./login')
    process.env.INV_CREDENITALS_SECRET_ARN = 'test-secret-arn'
    const mockSecret = {
      INV_API_KEY: 'test-api-key',
      INV_BASE_URL: 'https://api.example.com',
      INV_USER: 'test@example.com',
      INV_PASSWORD: 'password',
      INV_ROLE: 'test-role',
    }
    const mockCookie: setCookie.Cookie[] = [{ name: 'test', value: 'cookie' }]
    authenticateMock.mockResolvedValue({ cookie: mockCookie, statusCode: 200 })

    const result = await login(mockSecret)

    expect(result).toStrictEqual(mockCookie)
    expect(serverLoggerMock.debug).toHaveBeenCalledWith({}, 'reached login')
  })

  it('should throw an error if API key or base URL is not defined', async () => {
    const { login } = await import('./login')

    const mockSecret = {
      INV_API_KEY: '',
      INV_BASE_URL: '',
      INV_USER: 'test@example.com',
      INV_PASSWORD: 'password',
      INV_ROLE: 'test-role',
    }

    await expect(login(mockSecret)).rejects.toThrow(
      new AvAdaptorInternalServerError('api key or api url is not defined')
    )
    expect(serverLoggerMock.error).toHaveBeenCalled()
  })

  it('should throw an error if email or password is not defined', async () => {
    const { login } = await import('./login')

    const mockSecret = {
      INV_API_KEY: 'test-api-key',
      INV_BASE_URL: 'https://api.example.com',
      INV_USER: '',
      INV_PASSWORD: '',
      INV_ROLE: 'test-role',
    }

    await expect(login(mockSecret)).rejects.toThrow(
      new AvAdaptorUnAuthorizedError(
        'Authentication failed : invalid credentials'
      )
    )
    expect(serverLoggerMock.error).toHaveBeenCalled()
  })

  it('should throw an error if authentication fails', async () => {
    const { login } = await import('./login')

    const mockSecret = {
      INV_API_KEY: 'test-api-key',
      INV_BASE_URL: 'https://api.example.com',
      INV_USER: 'test email',
      INV_PASSWORD: 'secret pass',
      INV_ROLE: 'test-role',
    }
    authenticateMock.mockResolvedValue({ cookie: null, statusCode: 401 })

    await expect(login(mockSecret)).rejects.toThrow(
      new AvAdaptorUnAuthorizedError('Authentication failed')
    )
    expect(serverLoggerMock.error).toHaveBeenCalled()
  })

  it('should throw an internal server error for unhandled exceptions', async () => {
    const { login } = await import('./login')

    const mockSecret = {
      INV_API_KEY: 'test-api-key',
      INV_BASE_URL: 'https://api.example.com',
      INV_USER: 'test@example.com',
      INV_PASSWORD: 'password',
      INV_ROLE: 'test-role',
    }
    authenticateMock.mockRejectedValue(new Error('Unhandled error'))

    await expect(login(mockSecret)).rejects.toThrow(
      new AvAdaptorInternalServerError('Something went wrong')
    )
    expect(serverLoggerMock.error).toHaveBeenCalled()
  })
})
