import { Session } from 'electron'

const HTTP_EXCEPTIONS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

export function shouldRedirectToHttps(url: string): string | null {
  if (!url.startsWith('http:')) return null
  try {
    const parsed = new URL(url)
    if (HTTP_EXCEPTIONS.has(parsed.hostname)) return null
    return url.replace(/^http:/, 'https:')
  } catch {
    return null
  }
}

export function setupSecurityHeaders(sess: Session): void {
  sess.webRequest.onHeadersReceived(
    { urls: ['https://*/*'] },
    (details, callback) => {
      const headers = {
        ...details.responseHeaders,
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['SAMEORIGIN'],
      }
      callback({ responseHeaders: headers })
    }
  )
}
