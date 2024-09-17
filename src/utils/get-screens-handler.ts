import { serverLogger } from '@inventory-service/server-logger-library'

import {
  AvAdaptorError,
  AvAdaptorInternalServerError,
} from './inv-adaptor-exceptions'
import { getScreensForStorageFromINV } from './get-screens-for-storage-from-inv'
import { convertStorageDataRecords } from './convert-storage-data'
import { removeStateKey } from './helper'

import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'
import type { StorageData } from '../types/get-screens-response'

export const getScreensHandler = async (
  avCredentialsSecret: INVCredentialsSecret,
  cookies: Cookies,
  storageSlug: string
): Promise<StorageData[]> => {
  const logger = serverLogger.getInstance()

  try {
    const response = await getScreensForStorageFromINV(
      avCredentialsSecret,
      cookies,
      storageSlug
    )
    if (response.errorCode) {
      throw new AvAdaptorError(
        response.errorCode,
        response?.message ?? 'Something went wrong'
      )
    }
    removeStateKey(response.data.Result)
    const screens = convertStorageDataRecords(response.data.Result)
    if (screens.length === 0) {
      throw new AvAdaptorError('404', 'No screens found for the storage')
    }
    return screens
  } catch (ex) {
    logger.error(ex, 'something went wrong while fetching screens for storage')
    if (ex instanceof AvAdaptorError) {
      throw ex
    } else {
      throw new AvAdaptorInternalServerError('Something went wrong')
    }
  }
}
