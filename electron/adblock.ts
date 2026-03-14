// High-signal tracker/ad domain list
const BLOCKED_DOMAINS: readonly string[] = [
  // Google Analytics / Ads
  'google-analytics.com', 'googletagmanager.com', 'googletagservices.com',
  'googlesyndication.com', 'doubleclick.net', 'adservice.google.com',
  // Facebook
  'connect.facebook.net', 'pixel.facebook.com',
  // Analytics
  'hotjar.com', 'mixpanel.com', 'segment.io', 'segment.com',
  'amplitude.com', 'fullstory.com', 'mouseflow.com', 'heap.io',
  // Ad networks
  'adroll.com', 'criteo.com', 'outbrain.com', 'taboola.com',
  'rubiconproject.com', 'openx.net', 'pubmatic.com', 'appnexus.com',
  'advertising.com', 'adnxs.com', 'scorecardresearch.com',
  // CDN-based trackers
  'bat.bing.com', 'mc.yandex.ru', 'cdn.heapanalytics.com',
]

const blockedSet = new Set(BLOCKED_DOMAINS)

export let blockedCount = 0

export function shouldBlockUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    const parts = hostname.split('.')
    for (let i = 0; i < parts.length - 1; i++) {
      if (blockedSet.has(parts.slice(i).join('.'))) return true
    }
    return false
  } catch {
    return false
  }
}

export function incrementBlockedCount(): void {
  blockedCount++
}
