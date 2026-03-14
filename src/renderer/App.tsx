import React from 'react'
import { TabBar } from './components/TabBar'
import { Toolbar } from './components/Toolbar'
import { BrowserView } from './components/BrowserView'
import { useBrowserStore } from './store/browserStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import './styles/global.css'

export function App() {
  const { activeTab } = useBrowserStore()
  useKeyboardShortcuts()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#f5f0e8',
    }}>
      <TabBar />
      <Toolbar />
      {activeTab?.isLoading && <div className="loading-bar" />}
      <BrowserView />
    </div>
  )
}
