import * as http from 'http'
import * as https from 'https'

import { createHttpAgent, createHeaders, callApi } from './api-client'
import { toCookieString } from './cookies'

import type { ApiClientConfig, HeaderConfig } from '../types/config'

jest.mock('http')
jest.mock('https')
jest.mock('set-cookie-parser')

jest.mock('@inventory-service/server-logger-library', () => ({
  serverLogger: {
    getInstance: () => ({
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    }),
  },
}))

jest.spyOn(global, 'fetch').mockImplementation()

describe('api-client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createHttpAgent', () => {
    it('should return an http.Agent for http URLs', () => {
      const agent = createHttpAgent('http://example.com')

      expect(agent).toBeInstanceOf(http.Agent)
    })

    it('should return an https.Agent for https URLs', () => {
      const agent = createHttpAgent('https://example.com')

      expect(agent).toBeInstanceOf(https.Agent)
    })
  })

  describe('createHeaders', () => {
    it('should create headers with content type and accept', () => {
      const headersConfig: HeaderConfig = {
        contentType: 'application/json',
        cookie: {}, // Empty array for cookies
      }
      const headers = createHeaders(headersConfig)

      expect(headers).toStrictEqual({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': '', // Include the Cookie header in the expected output
      })
    })
  })

  describe('callApi', () => {
    it('should call the API and return the response and cookies', async () => {
      // Setup for the test
      const response = { data: 'test' }
      const cookies = {
        cookieName: 'cookieData',
      }

      // Mock the HTTP request and response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => response,
        headers: {
          get: (name: string) =>
            name === 'set-cookie' ? toCookieString(cookies) : null,
        },
      })

      const apiConfig: ApiClientConfig = {
        apiKey: 'test-api',
        apiUrl: 'https://api.example.com',
      }
      const result = await callApi(apiConfig, '', 'GET', {
        contentType: 'application/json',
        cookie: {},
      })

      expect(result).toStrictEqual({ response, cookie: cookies })
      // expect(mockLogger.info).toHaveBeenCalled()
    })
  })
})
