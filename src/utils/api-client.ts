import * as http from 'http'
import * as https from 'https'

import { HttpError } from './inv-adaptor-exceptions'
import { parseCookies, toCookieString } from './cookies'

import type { INVResponseInfoAndError } from '../types/inventory-responses'
import type { ApiClientConfig, Cookies, HeaderConfig } from '../types/config'

const createHttpAgent = (apiUrl: string): http.Agent | https.Agent => {
  const parsedUrl = new URL(apiUrl)
  if (parsedUrl.protocol === 'http:') {
    return new http.Agent({ keepAlive: true })
  } else {
    return new https.Agent({ keepAlive: true })
  }
}

const createHeaders = (
  headersConfig: HeaderConfig
): globalThis.RequestInit['headers'] => {
  return {
    'Content-Type': headersConfig.contentType,
    'Accept': 'application/json',
    ...(headersConfig.cookie && {
      Cookie: toCookieString(headersConfig.cookie),
    }),
  }
}

const parseResponseJson = async <T>(
  res: globalThis.Response,
  endpoint: string
) => {
  try {
    return (await res.json()) as T & INVResponseInfoAndError
  } catch (err: unknown) {
    const error = err as Error
    throw new Error(`${endpoint} failed: ${error.message}`)
  }
}

const callApi = async <T>(
  config: ApiClientConfig,
  path: string,
  body: string | undefined,
  headersConfig: HeaderConfig
) => {
  const endpoint = new URL(path, config.apiUrl)
  endpoint.searchParams.append('api_key', config.apiKey)
  const options: globalThis.RequestInit = {
    method: 'POST',
    ...(body && { body }),
    headers: createHeaders(headersConfig),
  }
  let res: globalThis.Response
  let cookie: Cookies = {}
  try {
    res = await fetch(endpoint.toString(), options)
    const rawCookie = res.headers.get('set-cookie')
    cookie = parseCookies(rawCookie ?? '')
  } catch (err: unknown) {
    const error = err as Error
    throw new HttpError(`${String(endpoint)} failed: ${error.message}`, 500)
  }
  const response = await parseResponseJson<T>(res, endpoint.toString())
  return { cookie, response }
}

export { createHttpAgent, createHeaders, parseResponseJson, callApi }
