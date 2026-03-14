import React from 'react'
import { useRoughSVG } from '../sketch/useRoughSVG'
import { useBrowserStore } from '../store/browserStore'
import type { Tab } from '../types'

const TAB_W = 180
const TAB_H = 34

interface SketchTabProps {
  tab: Tab
  isActive: boolean
  onActivate: () => void
  onClose: (e: React.MouseEvent) => void
}

function SketchTab({ tab, isActive, onActivate, onClose }: SketchTabProps) {
  const shapes = [{
    type: 'rect' as const,
    x: 2,
    y: isActive ? 0 : 4,
    w: TAB_W - 4,
    h: isActive ? TAB_H : TAB_H - 4,
  }]

  const seed = tab.id.charCodeAt(0) + tab.id.charCodeAt(1)

  const ref = useRoughSVG(shapes, {
    roughness: 1.2,
    stroke: isActive ? '#2c2416' : '#8c7f6a',
    strokeWidth: isActive ? 2 : 1.4,
    fill: isActive ? '#f5f0e8' : '#ede8dc',
    fillStyle: 'solid',
    seed,
  })

  return (
    <div
      style={{
        position: 'relative',
        width: TAB_W,
        height: TAB_H,
        cursor: 'pointer',
        flexShrink: 0,
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
      onClick={onActivate}
    >
      <svg
        ref={ref}
        width={TAB_W}
        height={TAB_H}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        height: '100%',
        fontFamily: "'Caveat', cursive",
        fontSize: 14,
        color: isActive ? '#2c2416' : '#8c7f6a',
        overflow: 'hidden',
        gap: 4,
      }}>
        {tab.favicon && (
          <img src={tab.favicon} width={14} height={14} style={{ flexShrink: 0 }} alt="" />
        )}
        {tab.isPrivate && <span style={{ flexShrink: 0 }}>🕵️</span>}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tab.title}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            color: 'inherit',
            padding: '0 2px',
            flexShrink: 0,
            lineHeight: 1,
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}
        >×</button>
      </div>
    </div>
  )
}

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, openNewTab } = useBrowserStore()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      background: '#ede8dc',
      padding: '4px 4px 0',
      overflowX: 'auto',
      flexShrink: 0,
      WebkitAppRegion: 'drag',
    } as React.CSSProperties}>
      {tabs.map(tab => (
        <SketchTab
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onActivate={() => setActiveTab(tab.id)}
          onClose={(e) => { e.stopPropagation(); closeTab(tab.id) }}
        />
      ))}
      <div style={{ display: 'flex', gap: 4, alignSelf: 'center', paddingLeft: 4, WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => openNewTab()}
          title="Neuer Tab"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Caveat', cursive",
            fontSize: 22,
            color: '#5c4f3a',
            lineHeight: 1,
            padding: '0 8px',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}
        >+</button>
        <button
          onClick={() => openNewTab(undefined, true)}
          title="Privater Tab"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Caveat', cursive",
            fontSize: 16,
            color: '#5c4f3a',
            padding: '0 6px',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}
        >🕵️</button>
      </div>
    </div>
  )
}
