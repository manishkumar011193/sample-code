import { serverLogger } from '@inventory-service/server-logger-library'

import { loadStockHandler } from './load-stock-handler'
import { saveStockMap } from './inv-save-stock-map'

import type {
  InventoryUpdateResponse,
  InventoryUpdateResponseSeat,
} from '../types/inventory-update-response'
import type { SaveStockReponse } from '../types/save-stocks'
import type { AdmissionData } from '../types/admission'
import type { StorageData } from '../types/get-screens-response'
import type { Cookies } from '../types/config'
import type { INVCredentialsSecret } from '../types/inventory-credentials-secret'
import type {
  InventoryUpdateRequest,
  InventoryUpdateRequestSection,
} from '../types/inventory-update-request'
import type { AllResponse } from '../types/inventory-responses'

export const updateSeatPricesForAllSections = async (
  avCredentialsSecret: INVCredentialsSecret,
  cookies: Cookies,
  inventoryUpdateRequest: InventoryUpdateRequest,
  allScreens: StorageData[],
  inventoryUpdateResponse: InventoryUpdateResponse
) => {
  const logger = serverLogger.getInstance()
  logger.debug({ inventoryUpdateRequest }, 'inside updateSeatPricesForAllSections')

  for (const section of inventoryUpdateRequest.sections) {
    const allSeatIdsInSection = getAllSeatIdsInSection(section)
    logger.debug({ allSeatIdsInSection }, 'allSeatIdsInSection')

    if (
      allSeatIdsInSectionAreTracked(allSeatIdsInSection, inventoryUpdateResponse)
    ) {
      continue
    }

    const screensBySection = filterScreensBySection(
      section.sectionId,
      allScreens
    )

    await loadStockPerScreenAndUpdateSeats(
      avCredentialsSecret,
      cookies,
      inventoryUpdateRequest,
      section,
      allSeatIdsInSection,
      screensBySection,
      inventoryUpdateResponse
    )

    handleSeatsWhichAreNotFoundInScreens(
      allSeatIdsInSection,
      inventoryUpdateResponse
    )
  }
}

export const loadStockPerScreenAndUpdateSeats = async (
  avCredentialsSecret: INVCredentialsSecret,
  cookies: Cookies,
  inventoryupdateRequest: InventoryUpdateRequest,
  section: InventoryUpdateRequestSection,
  allSeatIdsInSection: string[],
  screensBySection: StorageData[],
  inventoryUpdateResponse: InventoryUpdateResponse
) => {
  const logger = serverLogger.getInstance()
  logger.debug(
    {
      performanceId: inventoryupdateRequest.performance,
      section,
      allSeatIdsInSection,
      screensBySection,
    },
    'inside loadStockPerScreenAndUpdateSeats'
  )

  for (const screen of screensBySection) {
    const allStock = await loadStockHandler(
      avCredentialsSecret,
      cookies,
      'kdk',
      screen.screenId
    ).catch((ex) => {
      logger.error(ex, 'Error loading stock')
      updateInventoryUpdateResponseSectionError(
        inventoryUpdateResponse,
        section.sectionId,
        'Error loading stock for screenId: ' + screen.screenId
      )
      return []
    })

    const [soldStock, notSoldStock] = filterStock(
      allSeatIdsInSection,
      allStock,
      inventoryUpdateResponse
    )

    logger.debug(
      { allStockLength: allStock.length },
      `allStockLength`
    )

    logger.debug(
      { notSoldStockLength: notSoldStock.length },
      `notSoldStockLength`
    )

    const result = await saveStockMap(
      avCredentialsSecret,
      cookies,
      notSoldStock,
      inventoryupdateRequest.toinventoryId
    ).catch((ex) => {
      logger.error(ex, 'Error saving stock')
      return {
        errorCode: '500',
        message: 'Error updating seat',
      } as AllResponse<SaveStockReponse>
    })

    handleSaveStockMapResult(
      result,
      soldStock,
      notSoldStock,
      inventoryUpdateResponse
    )
  }
}

function updateInventoryUpdateResponseSeats(
  inventoryUpdateResponse: InventoryUpdateResponse,
  inventorySectionId: string,
  status: 'pending' | 'success' | 'failed',
  error: string
) {
  for (const section of inventoryUpdateResponse.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        if (seat.inventorySectionId !== inventorySectionId) continue
        seat.status = status
        seat.error = error
      }
    }
  }
}

function updateInventoryUpdateResponseSectionError(
  inventoryUpdateResponse: InventoryUpdateResponse,
  sectionId: string,
  error: string
) {
  for (const section of inventoryUpdateResponse.sections) {
    if (section.sectionId !== sectionId) continue
    section.errors.push(error)
  }
}

export const handleSeatsWhichAreNotFoundInScreens = (
  allSeatIdsInSection: string[],
  inventoryUpdateResponse: InventoryUpdateResponse
) => {
  allSeatIdsInSection.forEach((inventorySectionId) => {
    if (
      trackedSeatsIncludesSeatId(getTrackedSeats(inventoryUpdateResponse), inventorySectionId)
    )
      return
    updateInventoryUpdateResponseSeats(
      inventoryUpdateResponse,
      inventorySectionId,
      'failed',
      'Seat not found in screens'
    )
  })
}

export const handleSaveStockMapResult = (
  result: AllResponse<SaveStockReponse>,
  soldStock: AdmissionData[],
  notSoldStock: AdmissionData[],
  inventoryUpdateResponse: InventoryUpdateResponse
) => {
  if (result.errorCode) {
    updateTrackedSeats(
      notSoldStock,
      inventoryUpdateResponse,
      result.message ?? 'Error updating seat, Reason not provided',
      false
    )
  } else {
    updateTrackedSeats(notSoldStock, inventoryUpdateResponse, '', true)
  }
  updateTrackedSeats(
    soldStock,
    inventoryUpdateResponse,
    'Seat is already sold',
    false
  )
}

export const updateTrackedSeats = (
  stock: AdmissionData[],
  inventoryUpdateResponse: InventoryUpdateResponse,
  error: string,
  seatUpdated: boolean
) => {
  stock.forEach((admission) => {
    updateInventoryUpdateResponseSeats(
      inventoryUpdateResponse,
      admission.inventorySectionId,
      seatUpdated ? 'success' : 'failed',
      error
    )
  })
}

export const filterScreensBySection = (
  sectionId: string,
  allScreens: StorageData[]
) => {
  return allScreens.filter((screen) => screen.sectionId === sectionId)
}

export const getAllSeatIdsInSection = (section: InventoryUpdateRequestSection) => {
  return section.rows
    .map((row) => row.seats.map((seat) => seat.inventorySectionId))
    .flat()
    .filter((inventorySectionId) => inventorySectionId)
}

function getTrackedSeats(inventoryUpdateResponse: InventoryUpdateResponse) {
  return inventoryUpdateResponse.sections.flatMap((section) =>
    section.rows.flatMap((row) =>
      row.seats.filter((seat) => seat.status !== 'pending')
    )
  )
}

export const trackedSeatsIncludesSeatId = (
  trackedSeats: InventoryUpdateResponseSeat[],
  inventorySectionId: string
) => {
  return trackedSeats.some((seat) => seat.inventorySectionId === inventorySectionId)
}

export const allSeatIdsInSectionAreTracked = (
  allSeatIdsInSection: string[],
  inventoryUpdateResponse: InventoryUpdateResponse
) => {
  return allSeatIdsInSection.every((inventorySectionId) =>
    trackedSeatsIncludesSeatId(getTrackedSeats(inventoryUpdateResponse), inventorySectionId)
  )
}

export const getNotSoldStock = (stock: AdmissionData[]) => {
  return stock.filter((admission) => admission.status !== 'S')
}

export const getSoldStock = (stock: AdmissionData[]) => {
  return stock.filter((admission) => admission.status === 'S')
}

export const filterStock = (
  allSeatIdsInSection: string[],
  allStock: AdmissionData[],
  inventoryUpdateResponse: InventoryUpdateResponse
): [AdmissionData[], AdmissionData[]] => {
  const filtered = allStock.filter(
    (admission) =>
      allSeatIdsInSection.includes(admission.inventorySectionId) &&
      !trackedSeatsIncludesSeatId(
        getTrackedSeats(inventoryUpdateResponse),
        admission.inventorySectionId
      )
  )
  return [getSoldStock(filtered), getNotSoldStock(filtered)]
}
