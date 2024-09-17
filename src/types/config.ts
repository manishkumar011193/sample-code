export interface ApiClientConfig {
  apiKey: string
  apiUrl: string
  username?: string
  password?: string
  timeZoneLocation?: string
}

export type Cookies = Record<string, string>

export interface HeaderConfig {
  contentType: 'application/x-www-form-urlencoded' | 'application/json'
  cookie?: Cookies
}
