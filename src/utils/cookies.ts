export function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  cookieString.split(',').forEach((cookie) => {
    const [cookiePair] = cookie.trim().split(';')
    if (!cookiePair) return
    const [key, value] = cookiePair.split('=')
    // Assign the cookie value to the key, trimming any leading/trailing spaces
    if (!key) return
    cookies[key.trim()] = value ? value.trim() : ''
  })

  return cookies
}

const removeEmptyCookies = (
  cookies: Record<string, string>
): Record<string, string> => {
  const newCookies: Record<string, string> = {}
  Object.entries(cookies).forEach(([key, value]) => {
    if (value) newCookies[key] = value
  })
  return newCookies
}

export function toCookieString(cookies: Record<string, string>): string {
  return Object.entries(removeEmptyCookies(cookies))
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
}
