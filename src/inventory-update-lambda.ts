import { configureLambdaLogger } from './utils/logger'
import { login } from './utils/login'
import { logoutHandler } from './utils/logout'
import { getScreensHandler } from './utils/get-screens-handler'
import { updateSeatPricesForAllSections } from './utils/update-seat-inventorys'
import { validateInventoryUpdateRequest } from './utils/validate-inventory-update-request'
import { INV_CREDENITALS_SECRET_ARN } from './environment'
import { getSecretValue } from './utils/secret-provider'

import type {
  InventoryUpdateResponse,
  InventoryUpdateResponseSection,
} from './types/inventory-update-response'
import type { InventoryUpdateRequest } from './types/inventory-update-request'
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'

function getResponseSections(
  sections: InventoryUpdateRequest['sections']
): InventoryUpdateResponseSection[] {
  return sections.map((section) => ({
    sectionId: section.sectionId,
    name: section.name,
    rows: section.rows.map((row) => ({
      row: row.row,
      seats: row.seats.map((seat) => ({
        number: seat.number,
        inventorySectionId: seat.inventorySectionId,
        status: 'pending',
        error: '',
      })),
    })),
    errors: [],
  }))
}

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> {
  const logger = configureLambdaLogger(event, 'inventory-update-service')

  logger.debug({ event, context }, 'API Gateway Event')

  let body: Record<string, unknown> = {}

  let inventoryUpdateResponse: InventoryUpdateResponse = {
    performance: '',
    sections: [],
    toinventoryId: '',
    storageSlug: '',
    errors: [],
  }

  try {
    body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
    logger.debug({ body }, 'Request body')

    const inventoryUpdateRequest =
      validateInventoryUpdateRequest<InventoryUpdateRequest>(body)

    inventoryUpdateResponse = {
      performance: inventoryUpdateRequest.performance,
      sections: getResponseSections(inventoryUpdateRequest.sections),
      toinventoryId: inventoryUpdateRequest.toinventoryId,
      storageSlug: inventoryUpdateRequest.storageSlug,
      errors: [],
    }

    // Get the INV credentials from the secret manager
    const inventorySecretCredentials = await getSecretValue(
      INV_CREDENITALS_SECRET_ARN ?? ''
    ).catch((error) => {
      inventoryUpdateResponse.errors.push('Error fetching INV credentials')
      throw error
    })

    // For Login
    const cookies = await login(inventorySecretCredentials).catch((error) => {
      inventoryUpdateResponse.errors.push('Error logging in')
      throw error
    })
    logger.debug({ cookies }, 'Cookies from login')

    //for get screens handler
    const screens = await getScreensHandler(
      inventorySecretCredentials,
      cookies,
      inventoryUpdateRequest.storageSlug
    ).catch((error) => {
      inventoryUpdateResponse.errors.push('Error fetching screens')
      throw error
    })
    logger.debug({ screens }, 'Screens from get-screens-handler')

    await updateSeatPricesForAllSections(
      inventorySecretCredentials,
      cookies,
      inventoryUpdateRequest,
      screens,
      inventoryUpdateResponse
    )

    // For Logout
    const logoutResponse = await logoutHandler(inventorySecretCredentials, cookies)
    logger.debug({ logoutResponse }, 'Logout response')

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: inventoryUpdateResponse,
      }),
    }
  } catch (error) {
    logger.error({ error }, 'Error processing request')
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        data: inventoryUpdateResponse,
      }),
    }
  }
}
