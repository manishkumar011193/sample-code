import { serverLogger } from '@inventory-service/server-logger-library'

import {
  AvAdaptorError,
  AvAdaptorInternalServerError,
} from './inv-adaptor-exceptions'
import { callAvApi } from './base'

import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'
import type { StorageResponse } from '../types/get-screens-response'

export const getScreensForStorageFromINV = async (
  avCredentialsSecret: INVCredentialsSecret,
  cookies: Cookies,
  valueSlug: string
) => {
  const logger = serverLogger.getInstance()

  try {
    const body = JSON.stringify({
      actions: [
        {
          method: 'search',
          acceptWarnings: [4276],
        },
      ],
      set: {
        'Query': {
          Clause: {
            '+1': {
              name: 'Storage.storage_data3',
              oper: '=',
              type: 'matchCondition',
              value: valueSlug,
            },
          },
          ResultMember: {
            '+1': {
              name: 'seat_storage_id',
              order: 1,
            },
            '+2': {
              name: 'Storage.storage_name',
              order: 2,
            },
            '+14': {
              name: 'Storage.storage_data3',
              order: 14,
            },
            '+22': {
              name: 'seat_storage_screen_id',
              order: 22,
            },
            '+3': {
              name: 'Section.section_id',
              order: 3,
              option: 5,
            },
          },
        },
        'Search::object': 'ts_seat',
        'Search::page_size': 1000,
      },
      get: ['Result'],
    })

    const result = await callAvApi<StorageResponse>(
      {
        apiKey: avCredentialsSecret.INV_API_KEY,
        apiUrl: avCredentialsSecret.INV_BASE_URL,
      },
      'search',
      body,
      {
        contentType: 'application/json',
        cookie: cookies,
      }
    )

    return result.response
  } catch (ex) {
    logger.error(ex, 'something went wrong while logging in')
    if (ex instanceof AvAdaptorError) {
      throw ex
    } else {
      throw new AvAdaptorInternalServerError('Something went wrong')
    }
  }
}
