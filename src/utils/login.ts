import { serverLogger } from '@inventory-service/server-logger-library'

import {
  AvAdaptorError,
  AvAdaptorInternalServerError,
  AvAdaptorUnAuthorizedError,
} from './inv-adaptor-exceptions'
import { authenticate } from './account'

import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'

export const login = async (
  avCredentialsSecret: INVCredentialsSecret
): Promise<Cookies> => {
  const logger = serverLogger.getInstance()
  try {
    logger.debug({}, 'reached login')

    const {
      INV_API_KEY,
      INV_BASE_URL,
      INV_USER: email,
      INV_PASSWORD: password,
      INV_ROLE: role,
    } = avCredentialsSecret

    if (!INV_BASE_URL || !INV_API_KEY) {
      throw new AvAdaptorInternalServerError(
        'api key or api url is not defined'
      )
    }

    if (!email || !password) {
      throw new AvAdaptorUnAuthorizedError(
        'Authentication failed : invalid credentials'
      )
    }
    const { cookie, statusCode } = await authenticate(
      { apiKey: INV_API_KEY, apiUrl: INV_BASE_URL },
      {
        email,
        password,
        role,
      }
    )

    if (statusCode !== 200 || !cookie) {
      throw new AvAdaptorUnAuthorizedError('Authentication failed')
    }

    return cookie
  } catch (ex) {
    logger.error(ex, 'something went wrong while logging in')
    if (ex instanceof AvAdaptorError) {
      throw ex
    } else {
      throw new AvAdaptorInternalServerError('Something went wrong')
    }
  }
}
