export interface SecurityStatus {
  isHttps: boolean
  adBlockActive: boolean
  jsEnabled: boolean
  blockedRequestCount: number
}

export interface Tab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isPrivate: boolean
  securityStatus: SecurityStatus
}
