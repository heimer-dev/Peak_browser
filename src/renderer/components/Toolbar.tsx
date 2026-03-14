import React, { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { SketchButton } from './SketchButton'
import { SketchInput, SketchInputHandle } from './SketchInput'
import { SecurityIndicator } from './SecurityIndicator'
import { SearchEngineSelector, SEARCH_ENGINES, SearchEngine } from './SearchEngineSelector'
import { useBrowserStore, NEW_TAB_URL } from '../store/browserStore'

declare global {
  interface Window {
    peakAPI?: {
      toggleJS: (origin: string, enabled: boolean) => Promise<void>
      getBlockedCount: () => Promise<number>
      openExternal: (url: string) => Promise<void>
    }
  }
}

function sanitizeUrl(input: string, engine: SearchEngine): string {
  const trimmed = input.trim()
  if (!trimmed) return engine.baseUrl
  if (trimmed.startsWith('about:')) return trimmed
  // Has protocol → direct URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  // Looks like a domain (has a dot, no spaces)
  if (!trimmed.includes(' ') && trimmed.includes('.')) return `https://${trimmed}`
  // Otherwise: search query
  return engine.searchUrl.replace('%s', encodeURIComponent(trimmed))
}

export function Toolbar() {
  const { activeTab, navigate, updateTab, focusUrlBarTrigger } = useBrowserStore()
  const [urlDraft, setUrlDraft] = useState(activeTab?.url ?? '')
  const [searchEngine, setSearchEngine] = useState<SearchEngine>(SEARCH_ENGINES[0])
  const inputRef = useRef<SketchInputHandle>(null)

  useEffect(() => {
    const url = activeTab?.url ?? ''
    setUrlDraft(url === NEW_TAB_URL ? '' : url)
  }, [activeTab?.url])

  // Ctrl+L / F6 → focus + select all
  useEffect(() => {
    if (focusUrlBarTrigger === 0) return
    inputRef.current?.focus()
    inputRef.current?.selectAll()
  }, [focusUrlBarTrigger])

  // Periodically update blocked count from main process
  useEffect(() => {
    if (!window.peakAPI) return
    const id = setInterval(async () => {
      const count = await window.peakAPI!.getBlockedCount()
      if (activeTab) {
        updateTab(activeTab.id, {
          securityStatus: { ...activeTab.securityStatus, blockedRequestCount: count }
        })
      }
    }, 3000)
    return () => clearInterval(id)
  }, [activeTab?.id])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !urlDraft.trim()) return
    const url = sanitizeUrl(urlDraft, searchEngine)
    navigate(url)
  }

  const handleBack = () => {
    const wv = document.querySelector(`webview[data-tab-id="${activeTab?.id}"]`) as HTMLElement & { goBack: () => void }
    wv?.goBack()
  }

  const handleForward = () => {
    const wv = document.querySelector(`webview[data-tab-id="${activeTab?.id}"]`) as HTMLElement & { goForward: () => void }
    wv?.goForward()
  }

  const handleReload = () => {
    const wv = document.querySelector(`webview[data-tab-id="${activeTab?.id}"]`) as HTMLElement & { reload: () => void }
    wv?.reload()
  }

  const handleToggleJS = async () => {
    if (!activeTab || !window.peakAPI) return
    const newEnabled = !activeTab.securityStatus.jsEnabled
    try {
      const origin = new URL(activeTab.url).origin
      await window.peakAPI.toggleJS(origin, newEnabled)
      updateTab(activeTab.id, {
        securityStatus: { ...activeTab.securityStatus, jsEnabled: newEnabled }
      })
    } catch { /* invalid URL */ }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 8px',
      background: '#f5f0e8',
      borderBottom: '2px solid #d4c9b0',
      WebkitAppRegion: 'drag',
      minWidth: 0,
    } as React.CSSProperties}>
      {/* Nav buttons */}
      <SketchButton icon="←" onClick={handleBack} disabled={!activeTab?.canGoBack}
        width={34} height={34} title="Zurück" />
      <SketchButton icon="→" onClick={handleForward} disabled={!activeTab?.canGoForward}
        width={34} height={34} title="Vor" />
      <SketchButton icon="↺" onClick={handleReload} width={34} height={34} title="Neu laden" />

      {/* Security lock icon */}
      {activeTab && (
        <SecurityIndicator status={activeTab.securityStatus} compact />
      )}

      {/* URL / Search bar — flex: 1 makes it fill all remaining space */}
      <SketchInput
        ref={inputRef}
        value={urlDraft}
        onChange={setUrlDraft}
        onKeyDown={handleKeyDown}
        placeholder="Adresse oder Suche eingeben..."
      />

      {/* Search engine selector */}
      <SearchEngineSelector
        selected={searchEngine}
        onChange={setSearchEngine}
      />

      {/* JS toggle */}
      <SketchButton
        label="JS"
        active={activeTab?.securityStatus.jsEnabled ?? true}
        onClick={handleToggleJS}
        width={40} height={34}
        title={activeTab?.securityStatus.jsEnabled ? 'JavaScript deaktivieren' : 'JavaScript aktivieren'}
      />

      {activeTab?.isPrivate && (
        <span style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 12,
          color: '#5c4f3a',
          padding: '2px 6px',
          background: '#ede8dc',
          borderRadius: 3,
          flexShrink: 0,
        }}>
          🕵️
        </span>
      )}
    </div>
  )
}
