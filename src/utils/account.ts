import { serverLogger } from '@inventory-service/server-logger-library'

import { INVStatus } from '../types/inventory-status'

import { INVErrorCodes } from './inv-error-codes'
import { callAvApi } from './base'

import type { SessionInfo } from '../types/inventory-responses'
import type { ApiClientConfig, Cookies } from '../types/config'
import type {
  AuthenticateApiResponse,
  AuthenticateRequest,
  AuthenticateResponse,
} from '../types/responses'

const authenticate = async (
  config: ApiClientConfig,
  request: AuthenticateRequest
): Promise<AuthenticateResponse> => {
  const path = 'session/authenticateUser'
  const logger = serverLogger.getInstance()

  const body = {
    userid: request.email,
    password: request.password,
  }

  const jsonBody = JSON.stringify(body)

  try {
    const { cookie, response } = await callAvApi<AuthenticateApiResponse>(
      config,
      path,
      jsonBody,
      {
        contentType: 'application/json',
      }
    )

    if (response.exception) {
      const avErrorCode = INVErrorCodes[response.exception.number]
      if (avErrorCode) {
        logger.error(
          {
            email: request.email,
            code: avErrorCode.code,
            message: avErrorCode.message,
            response,
          },
          'INV Error authenticating user'
        )
        return {
          statusCode: avErrorCode.code,
          code: avErrorCode.message,
          session: response.session,
        }
      } else {
        logger.error(
          {
            email: request.email,
            response,
          },
          'Error authenticating user'
        )
        return {
          statusCode: 500,
          code: INVStatus.Error,
        }
      }
    } else if (response.errorCode) {
      logger.error(
        {
          email: request.email,
          response,
        },
        'Could not connect to INV for authentication'
      )
      return {
        statusCode: 500,
        code: INVStatus.Error,
      }
    }

    return {
      statusCode: 200,
      cookie,
      session: response.session,
    }
  } catch (error) {
    logger.error(
      {
        email: request.email,
        error,
      },
      'Error validating user credentials'
    )
    return {
      statusCode: 500,
      code: INVStatus.Error,
    }
  }
}

const logout = async (
  config: ApiClientConfig,
  cookies: Cookies
): Promise<SessionInfo | null> => {
  const logger = serverLogger.getInstance()
  try {
    const path = 'session/logout'
    const { cookie, response } = await callAvApi(
      config,
      path,
      JSON.stringify({}),
      {
        contentType: 'application/json',
        cookie: cookies,
      }
    )

    if (response.errorCode) {
      logger.error({ response }, 'Session is already expired')
      return {
        session: response.session,
        version: response.version,
      }
    }

    if (cookie.session !== '') {
      logger.error({ cookie, response }, 'Error logging out')
      return null
    }

    return response
  } catch (error) {
    logger.error({ error }, 'Error logging out')
    return null
  }
}

export { authenticate, logout }
