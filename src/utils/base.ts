import { serverLogger } from '@inventory-service/server-logger-library'

import { callApi } from './api-client'

import type { HttpError } from './inv-adaptor-exceptions'
import type { ApiClientConfig, HeaderConfig } from '../types/config'

const callAvApi = async <T>(
  apiClientConfig: ApiClientConfig,
  path: string,
  body: string | undefined,
  headersConfig: HeaderConfig
) => {
  const logger = serverLogger.getInstance()

  const response = await callApi<T>(
    apiClientConfig,
    path,
    body,
    headersConfig
  ).catch((error: HttpError) => {
    logger.error({ error }, 'Error calling API')
    throw error
  })

  return response
}

export { callAvApi }
