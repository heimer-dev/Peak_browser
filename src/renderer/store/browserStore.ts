import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Tab, SecurityStatus } from '../types'

const DEFAULT_SECURITY: SecurityStatus = {
  isHttps: false,
  adBlockActive: true,
  jsEnabled: true,
  blockedRequestCount: 0,
}

export const NEW_TAB_URL = 'peak:newtab'

function newTab(url = NEW_TAB_URL, isPrivate = false): Tab {
  return {
    id: nanoid(),
    title: 'Neuer Tab',
    url,
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isPrivate,
    securityStatus: { ...DEFAULT_SECURITY },
  }
}

interface BrowserState {
  tabs: Tab[]
  activeTabId: string
  activeTab: Tab
  closedTabUrls: string[]        // for Ctrl+Shift+T
  focusUrlBarTrigger: number     // increment to trigger focus
  openNewTab: (url?: string, isPrivate?: boolean) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTab: (id: string, patch: Partial<Tab>) => void
  navigate: (url: string) => void
  switchToNextTab: () => void
  switchToPrevTab: () => void
  switchToTabIndex: (index: number) => void
  reopenLastClosedTab: () => void
  triggerFocusUrlBar: () => void
}

const initial = newTab()

export const useBrowserStore = create<BrowserState>((set, get) => ({
  tabs: [initial],
  activeTabId: initial.id,
  activeTab: initial,
  closedTabUrls: [],
  focusUrlBarTrigger: 0,

  openNewTab: (url?, isPrivate = false) => {
    const tab = newTab(url, isPrivate)
    set(s => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
      activeTab: tab,
    }))
  },

  closeTab: (id) => set(s => {
    const closing = s.tabs.find(t => t.id === id)
    const closedTabUrls = closing && closing.url !== NEW_TAB_URL
      ? [closing.url, ...s.closedTabUrls].slice(0, 20)
      : s.closedTabUrls

    const remaining = s.tabs.filter(t => t.id !== id)
    if (remaining.length === 0) {
      const t = newTab()
      return { tabs: [t], activeTabId: t.id, activeTab: t, closedTabUrls }
    }
    const wasActive = s.activeTabId === id
    if (!wasActive) return { tabs: remaining, closedTabUrls }
    const idx = s.tabs.findIndex(t => t.id === id)
    const newActive = remaining[Math.min(idx, remaining.length - 1)]
    return { tabs: remaining, activeTabId: newActive.id, activeTab: newActive, closedTabUrls }
  }),

  setActiveTab: (id) => set(s => {
    const tab = s.tabs.find(t => t.id === id)
    if (!tab) return s
    return { activeTabId: id, activeTab: tab }
  }),

  updateTab: (id, patch) => set(s => {
    const tabs = s.tabs.map(t => t.id === id ? { ...t, ...patch } : t)
    const activeTab = tabs.find(t => t.id === s.activeTabId) ?? s.activeTab
    return { tabs, activeTab }
  }),

  navigate: (url) => {
    const { activeTabId, updateTab } = get()
    updateTab(activeTabId, { url, title: url, isLoading: true })
  },

  switchToNextTab: () => set(s => {
    const idx = s.tabs.findIndex(t => t.id === s.activeTabId)
    const next = s.tabs[(idx + 1) % s.tabs.length]
    return { activeTabId: next.id, activeTab: next }
  }),

  switchToPrevTab: () => set(s => {
    const idx = s.tabs.findIndex(t => t.id === s.activeTabId)
    const prev = s.tabs[(idx - 1 + s.tabs.length) % s.tabs.length]
    return { activeTabId: prev.id, activeTab: prev }
  }),

  switchToTabIndex: (index) => set(s => {
    const tab = index === -1
      ? s.tabs[s.tabs.length - 1]
      : s.tabs[index]
    if (!tab) return s
    return { activeTabId: tab.id, activeTab: tab }
  }),

  reopenLastClosedTab: () => {
    const { closedTabUrls, openNewTab } = get()
    if (closedTabUrls.length === 0) return
    const [url, ...rest] = closedTabUrls
    openNewTab(url)
    set({ closedTabUrls: rest })
  },

  triggerFocusUrlBar: () => set(s => ({ focusUrlBarTrigger: s.focusUrlBarTrigger + 1 })),
}))
