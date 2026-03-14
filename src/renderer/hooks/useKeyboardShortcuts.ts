import { useEffect } from 'react'
import { useBrowserStore, NEW_TAB_URL } from '../store/browserStore'

function getActiveWebview(tabId: string) {
  return document.querySelector(`webview[data-tab-id="${tabId}"]`) as HTMLElement & {
    goBack(): void
    goForward(): void
    reload(): void
    reloadIgnoringCache(): void
    stop(): void
    getWebContentsId(): number
  } | null
}

export function useKeyboardShortcuts() {
  const {
    activeTab,
    tabs,
    openNewTab,
    closeTab,
    navigate,
    switchToNextTab,
    switchToPrevTab,
    switchToTabIndex,
    reopenLastClosedTab,
    triggerFocusUrlBar,
    activeTabId,
  } = useBrowserStore()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      const key = e.key

      // ── URL bar ───────────────────────────────────────────────
      if ((ctrl && key === 'l') || key === 'F6') {
        e.preventDefault()
        triggerFocusUrlBar()
        return
      }

      // ── Tabs ─────────────────────────────────────────────────
      if (ctrl && key === 't') {
        e.preventDefault()
        openNewTab()
        return
      }

      if (ctrl && e.shiftKey && key === 'T') {
        e.preventDefault()
        reopenLastClosedTab()
        return
      }

      if (ctrl && e.shiftKey && key === 'N') {
        e.preventDefault()
        openNewTab(undefined, true) // private tab
        return
      }

      if (ctrl && key === 'w') {
        e.preventDefault()
        closeTab(activeTabId)
        return
      }

      if (ctrl && key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) switchToPrevTab()
        else switchToNextTab()
        return
      }

      // Ctrl+1–8 → tab by index, Ctrl+9 → last tab
      if (ctrl && key >= '1' && key <= '9') {
        e.preventDefault()
        const n = parseInt(key, 10)
        switchToTabIndex(n === 9 ? -1 : n - 1)
        return
      }

      // ── Navigation ───────────────────────────────────────────
      const wv = activeTab?.url !== NEW_TAB_URL ? getActiveWebview(activeTabId) : null

      if ((ctrl && key === 'r') || key === 'F5') {
        e.preventDefault()
        if (e.shiftKey || e.ctrlKey && key === 'F5') {
          wv?.reloadIgnoringCache()
        } else {
          wv?.reload()
        }
        return
      }

      if (key === 'Escape') {
        // Stop loading if in progress
        if (activeTab?.isLoading) {
          e.preventDefault()
          wv?.stop()
        }
        return
      }

      if (e.altKey && (key === 'ArrowLeft' || key === 'Left')) {
        e.preventDefault()
        wv?.goBack()
        return
      }

      if (e.altKey && (key === 'ArrowRight' || key === 'Right')) {
        e.preventDefault()
        wv?.goForward()
        return
      }

      // ── Find in page ─────────────────────────────────────────
      // Ctrl+F: let it pass through to the webview naturally
      // (webview handles it internally if focused, otherwise no-op)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeTabId, activeTab?.url, activeTab?.isLoading, tabs.length])
}
