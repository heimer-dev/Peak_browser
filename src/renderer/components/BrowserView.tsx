import React, { useEffect, useRef } from 'react'
import { useBrowserStore, NEW_TAB_URL } from '../store/browserStore'
import { StartScreen } from './StartScreen'

// Augment JSX to allow <webview> tag
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          partition?: string
          webpreferences?: string
          allowpopups?: string
          'data-tab-id'?: string
        },
        HTMLElement
      >
    }
  }
}

interface WebviewElement extends HTMLElement {
  loadURL(url: string): void
  goBack(): void
  goForward(): void
  reload(): void
  canGoBack(): boolean
  canGoForward(): boolean
  getURL(): string
}

function SingleWebview({ tabId, url, isActive, isPrivate }: {
  tabId: string
  url: string
  isActive: boolean
  isPrivate: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const { updateTab } = useBrowserStore()
  const initialized = useRef(false)
  const domReady = useRef(false)
  const isNewTab = url === NEW_TAB_URL

  useEffect(() => {
    if (isNewTab) return
    const wv = ref.current as WebviewElement | null
    if (!wv) return

    const onLoadStart = () => updateTab(tabId, { isLoading: true })
    const onLoadStop = () => updateTab(tabId, { isLoading: false })

    const onNavigate = (e: Event & { url?: string }) => {
      const navUrl = e.url ?? wv.getURL()
      updateTab(tabId, {
        url: navUrl,
        securityStatus: {
          isHttps: navUrl.startsWith('https://'),
          adBlockActive: true,
          jsEnabled: true,
          blockedRequestCount: 0,
        },
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    }

    const onTitleUpdate = (e: Event & { title?: string }) => {
      if (e.title) updateTab(tabId, { title: e.title })
    }

    const onFaviconUpdate = (e: Event & { favicons?: string[] }) => {
      if (e.favicons?.[0]) updateTab(tabId, { favicon: e.favicons[0] })
    }

    const onNavState = () => {
      updateTab(tabId, {
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    }

    const onDomReady = () => { domReady.current = true }

    wv.addEventListener('dom-ready', onDomReady)
    wv.addEventListener('did-start-loading', onLoadStart)
    wv.addEventListener('did-stop-loading', onLoadStop)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('page-title-updated', onTitleUpdate)
    wv.addEventListener('page-favicon-updated', onFaviconUpdate)
    wv.addEventListener('did-navigate', onNavState)

    return () => {
      wv.removeEventListener('dom-ready', onDomReady)
      wv.removeEventListener('did-start-loading', onLoadStart)
      wv.removeEventListener('did-stop-loading', onLoadStop)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
      wv.removeEventListener('page-title-updated', onTitleUpdate)
      wv.removeEventListener('page-favicon-updated', onFaviconUpdate)
      wv.removeEventListener('did-navigate', onNavState)
    }
  }, [tabId, isNewTab])

  // Navigate when store URL changes
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }
    if (isNewTab) return
    const wv = ref.current as WebviewElement | null
    if (wv?.loadURL && domReady.current) wv.loadURL(url)
  }, [url, isNewTab])

  const hidden = { display: 'none' as const }
  const visible: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%' }

  return (
    <>
      {/* Start screen — shown when URL is peak:newtab */}
      <div style={{ ...visible, ...(isActive && isNewTab ? {} : hidden) }}>
        <StartScreen />
      </div>

      {/* Webview — shown for real URLs */}
      {!isNewTab && (
        <webview
          ref={ref}
          src={url}
          data-tab-id={tabId}
          partition={isPrivate ? 'in-memory-private' : 'persist:main'}
          webpreferences="contextIsolation=yes"
          style={{
            ...visible,
            border: 'none',
            ...(isActive ? {} : hidden),
          }}
        />
      )}
    </>
  )
}

export function BrowserView() {
  const { tabs, activeTabId } = useBrowserStore()

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {tabs.map(tab => (
        <SingleWebview
          key={tab.id}
          tabId={tab.id}
          url={tab.url}
          isActive={tab.id === activeTabId}
          isPrivate={tab.isPrivate}
        />
      ))}
    </div>
  )
}
