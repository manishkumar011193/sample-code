import { handler } from './inventory-update-lambda'
import { configureLambdaLogger } from './utils/logger'
import { login } from './utils/login'
import { logoutHandler } from './utils/logout'
import { getScreensHandler } from './utils/get-screens-handler'
import { updateSeatPricesForAllSections } from './utils/update-seat-inventorys'
import { getSecretValue } from './utils/secret-provider'
import { InventoryUpdateRequestMockData } from './___mocks___/inventory-update-request'
import { validateInventoryUpdateRequest } from './utils/validate-inventory-update-request'
import { InventoryUpdateResponseMockData } from './___mocks___/inventory-update-response'

import type { APIGatewayProxyEventV2, Context } from 'aws-lambda'

jest.mock('./utils/logger')
jest.mock('./utils/login')
jest.mock('./utils/logout')
jest.mock('./utils/get-screens-handler')
jest.mock('./utils/load-stock-handler')
jest.mock('./utils/update-seat-inventorys')
jest.mock('./utils/secret-provider')
jest.mock('./environment', () => ({
  INV_CREDENITALS_SECRET_ARN: 'mock-secret-arn',
}))

describe('handler', () => {
  let mockEvent: APIGatewayProxyEventV2
  let mockContext: Context

  beforeEach(() => {
    mockContext = {} as Context

    jest.clearAllMocks()
  })

  it('should return 200 and the expected response on success', async () => {
    const mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
    }

    mockEvent = {
      version: '2.0',
      routeKey: '',
      rawPath: '',
      rawQueryString: '',
      headers: {},
      requestContext: {
        accountId: '',
        apiId: '',
        domainName: '',
        domainPrefix: '',
        http: {
          method: '',
          path: '',
          protocol: '',
          sourceIp: '',
          userAgent: '',
        },
        requestId: '',
        routeKey: '',
        stage: '',
        time: '',
        timeEpoch: 0,
      },
      body: JSON.stringify(InventoryUpdateRequestMockData),
      isBase64Encoded: false,
    }
    ;(configureLambdaLogger as jest.Mock).mockReturnValue(mockLogger)
    ;(getSecretValue as jest.Mock).mockResolvedValue('mock-secret')
    ;(login as jest.Mock).mockResolvedValue('mock-cookies')
    ;(getScreensHandler as jest.Mock).mockResolvedValue('mock-screens')
    ;(updateSeatPricesForAllSections as jest.Mock).mockResolvedValue(
      'mock-trackedSeats'
    )
    ;(logoutHandler as jest.Mock).mockResolvedValue('mock-logout-response')

    const result = await handler(mockEvent, mockContext)

    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toStrictEqual({
      data: InventoryUpdateResponseMockData,
    })
    expect(mockLogger.debug).toHaveBeenCalled()
    expect(mockLogger.error).not.toHaveBeenCalled()
  })

  it('should return 500 and the error message on not sending InventoryUpdateRequest data in body', async () => {
    mockEvent = {
      version: '2.0',
      routeKey: '',
      rawPath: '',
      rawQueryString: '',
      headers: {},
      requestContext: {
        accountId: '',
        apiId: '',
        domainName: '',
        domainPrefix: '',
        http: {
          method: '',
          path: '',
          protocol: '',
          sourceIp: '',
          userAgent: '',
        },
        requestId: '',
        routeKey: '',
        stage: '',
        time: '',
        timeEpoch: 0,
      },
      body: JSON.stringify({}),
      isBase64Encoded: false,
    }
    const mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
    }
    ;(configureLambdaLogger as jest.Mock).mockReturnValue(mockLogger)
    ;(getSecretValue as jest.Mock).mockRejectedValue(new Error('mock error'))

    const result = await handler(mockEvent, mockContext)

    expect(() => validateInventoryUpdateRequest({})).toThrow(
      'Invalid InventoryUpdateRequest data'
    )
    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toStrictEqual({
      data: {
        performance: '',
        sections: [],
        toinventoryId: '',
        storageSlug: '',
        errors: [],
      },
      message: 'Internal Server Error',
    })
    expect(mockLogger.error).toHaveBeenCalled()
  })

  it('should return 500 and the error message on failure', async () => {
    const mockLogger = {
      debug: jest.fn(),
      error: jest.fn(),
    }
    ;(configureLambdaLogger as jest.Mock).mockReturnValue(mockLogger)
    ;(getSecretValue as jest.Mock).mockRejectedValue(new Error('mock error'))

    const result = await handler(mockEvent, mockContext)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toStrictEqual({
      data: {
        performance: '',
        sections: [],
        toinventoryId: '',
        storageSlug: '',
        errors: [],
      },
      message: 'Internal Server Error',
    })
    expect(mockLogger.error).toHaveBeenCalled()
  })
})
