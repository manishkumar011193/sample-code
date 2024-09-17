import { getScreensHandler } from './get-screens-handler'
import {
  AvAdaptorError,
  AvAdaptorInternalServerError,
} from './inv-adaptor-exceptions'
import { getScreensForStorageFromINV } from './get-screens-for-storage-from-inv'
import { convertStorageDataRecords } from './convert-storage-data'

import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'
import type { StorageData } from '../types/get-screens-response'

jest.mock('@inventory-service/server-logger-library')
jest.mock('./get-screens-for-storage-from-inv')
jest.mock('./convert-storage-data')

const serverLoggerMock = {
  debug: jest.fn(),
  error: jest.fn(),
}

jest.mock('@inventory-service/server-logger-library', () => ({
  serverLogger: {
    getInstance: () => serverLoggerMock,
  },
}))

describe('getScreensHandler', () => {
  const mockAvCredentialsSecret: INVCredentialsSecret = {
    INV_API_KEY: 'test-api-key',
    INV_BASE_URL: 'test-base-url',
    INV_USER: 'test-user',
    INV_PASSWORD: 'inv -password',
    INV_ROLE: 'test-role',
  }
  const mockCookies: Cookies = {
    /* mock data */
  }
  const mockStorageSlug = 'test-storage'
  const mockResponseData = { data: { Result: 'mock-result' } }

  beforeEach(() => {
    ;(getScreensForStorageFromINV as jest.Mock).mockResolvedValue(mockResponseData)

    jest.clearAllMocks()
  })

  it('should return converted storage data on success', async () => {
    const mockConvertedData: StorageData[] = [
      {
        screenId: 'mock-screen-id',
        sectionId: 'mock-section-id',
        storageId: 'mock-storage-id',
        storageName: 'mock-storage-name',
        storageSlug: 'mock-storage-slug',
      },
    ]
    ;(convertStorageDataRecords as jest.Mock).mockReturnValue(mockConvertedData)

    const result = await getScreensHandler(
      mockAvCredentialsSecret,
      mockCookies,
      mockStorageSlug
    )

    expect(result).toStrictEqual(mockConvertedData)
    expect(getScreensForStorageFromINV).toHaveBeenCalledWith(
      mockAvCredentialsSecret,
      mockCookies,
      mockStorageSlug
    )
    expect(convertStorageDataRecords).toHaveBeenCalledWith(
      mockResponseData.data.Result
    )
    expect(serverLoggerMock.error).not.toHaveBeenCalled()
  })

  it('should throw AvAdaptorError and log the error', async () => {
    const mockError = new AvAdaptorError('mock error', 'mock code')
    ;(getScreensForStorageFromINV as jest.Mock).mockRejectedValue(mockError)

    await expect(
      getScreensHandler(mockAvCredentialsSecret, mockCookies, mockStorageSlug)
    ).rejects.toThrow(AvAdaptorError)
    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      mockError,
      'something went wrong while fetching screens for storage'
    )
  })

  it('should throw AvAdaptorInternalServerError for generic errors and log the error', async () => {
    const mockError = new Error('mock error')
    ;(getScreensForStorageFromINV as jest.Mock).mockRejectedValue(mockError)

    await expect(
      getScreensHandler(mockAvCredentialsSecret, mockCookies, mockStorageSlug)
    ).rejects.toThrow(AvAdaptorInternalServerError)
    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      mockError,
      'something went wrong while fetching screens for storage'
    )
  })
})
