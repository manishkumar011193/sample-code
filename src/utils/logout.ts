import { serverLogger } from '@inventory-service/server-logger-library'

import { logout } from './account'
import {
  AvAdaptorInternalServerError,
  AvAdaptorError,
} from './inv-adaptor-exceptions'

import type { SessionInfo } from '../types/inventory-responses'
import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'

export const logoutHandler = async (
  avCredentialsSecret: INVCredentialsSecret,
  cookies: Cookies
): Promise<SessionInfo | null> => {
  const logger = serverLogger.getInstance()
  try {
    logger.debug({}, 'reached logout')
    if (Object.keys(cookies).length === 0) {
      throw new AvAdaptorInternalServerError('cookies is not defined')
    }

    const { INV_API_KEY, INV_BASE_URL } = avCredentialsSecret

    if (!INV_BASE_URL || !INV_API_KEY) {
      throw new AvAdaptorInternalServerError(
        'api key or api url is not defined'
      )
    }
    const logoutResponse = await logout(
      { apiKey: INV_API_KEY, apiUrl: INV_BASE_URL },
      cookies
    )

    if (!logoutResponse) {
      throw new AvAdaptorInternalServerError('Logout failed')
    }
    return logoutResponse
  } catch (ex) {
    logger.error('something went wrong while logging out', ex)
    if (ex instanceof AvAdaptorError) {
      throw ex
    } else {
      throw new AvAdaptorInternalServerError('Something went wrong')
    }
  }
}
