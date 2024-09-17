import { AvAdaptorInternalServerError } from './inv-adaptor-exceptions'

const getSecretValueMock = jest.fn()
const logoutMock = jest.fn()

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

  jest.mock('./secret-provider', () => ({
    getSecretValue: getSecretValueMock,
  }))

  jest.mock('./account', () => ({
    logout: logoutMock,
  }))

  jest.mock('@inventory-service/server-logger-library', () => ({
    serverLogger: {
      getInstance: () => ({
        debug: jest.fn(),
        error: jest.fn(),
      }),
    },
  }))

  const mockSecret = {
    INV_API_KEY: 'test-api-key',
    INV_BASE_URL: 'https://api.example.com',
    INV_USER: 'test email',
    INV_PASSWORD: 'secret pass',
    INV_ROLE: 'test-role',
  }

  const cookies = {
    cookie1: 'value1',
  }

  it('should successfully logout', async () => {
    const sessionInfo = {
      version: '7.67.8',
      session: '0E745FE8-51B1-4BC8-9C82-31162B526FE4',
    }
    logoutMock.mockResolvedValue(sessionInfo)

    const { logoutHandler } = await import('./logout')

    const result = await logoutHandler(mockSecret, cookies)

    expect(result).toStrictEqual(sessionInfo)
  })

  it('should throw error if avConnection is not defined', async () => {
    const { logoutHandler } = await import('./logout')

    await expect(logoutHandler(mockSecret, {})).rejects.toThrow(
      new AvAdaptorInternalServerError('cookies is not defined')
    )
  })

  it('should throw error if INV_API_KEY or INV_BASE_URL is not defined', async () => {
    const { logoutHandler } = await import('./logout')

    await expect(
      logoutHandler(
        {
          INV_API_KEY: '',
          INV_BASE_URL: '',
          INV_PASSWORD: 'secret pass',
          INV_ROLE: 'test-role',
          INV_USER: 'test email',
        },
        cookies
      )
    ).rejects.toThrow(
      new AvAdaptorInternalServerError('api key or api url is not defined')
    )
  })

  it('should throw error if logout fails', async () => {
    const { logoutHandler } = await import('./logout')

    getSecretValueMock.mockResolvedValue({
      INV_API_KEY: 'mockApiKey',
      INV_BASE_URL: 'mockBaseUrl',
    })
    logoutMock.mockResolvedValue(null)

    await expect(logoutHandler(mockSecret, cookies)).rejects.toThrow(
      new AvAdaptorInternalServerError('Logout failed')
    )
  })

  it('should handle general errors', async () => {
    const { logoutHandler } = await import('./logout')

    logoutMock.mockRejectedValue(new Error('General error'))

    await expect(logoutHandler(mockSecret, cookies)).rejects.toThrow(
      new AvAdaptorInternalServerError('Something went wrong')
    )
  })
})
