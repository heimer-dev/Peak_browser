import React, { useState, useRef, useEffect } from 'react'
import rough from 'roughjs'
import { SKETCH_OPTIONS } from '../sketch/roughConfig'

export interface SearchEngine {
  id: string
  name: string
  short: string
  searchUrl: string  // use %s as query placeholder
  baseUrl: string
}

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'ddg',
    name: 'DuckDuckGo',
    short: 'DDG',
    searchUrl: 'https://duckduckgo.com/?q=%s',
    baseUrl: 'https://duckduckgo.com',
  },
  {
    id: 'brave',
    name: 'Brave Search',
    short: 'Brave',
    searchUrl: 'https://search.brave.com/search?q=%s',
    baseUrl: 'https://search.brave.com',
  },
  {
    id: 'google',
    name: 'Google',
    short: 'Google',
    searchUrl: 'https://www.google.com/search?q=%s',
    baseUrl: 'https://www.google.com',
  },
  {
    id: 'bing',
    name: 'Bing',
    short: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=%s',
    baseUrl: 'https://www.bing.com',
  },
  {
    id: 'startpage',
    name: 'Startpage',
    short: 'Start',
    searchUrl: 'https://www.startpage.com/search?q=%s',
    baseUrl: 'https://www.startpage.com',
  },
]

interface SearchEngineSelectorProps {
  selected: SearchEngine
  onChange: (engine: SearchEngine) => void
}

function DropdownItem({ engine, isActive, onClick }: {
  engine: SearchEngine
  isActive: boolean
  onClick: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 140, H = 32

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    if (!isActive) return
    const rc = rough.svg(svg)
    const node = rc.rectangle(1, 1, W - 2, H - 2, {
      ...SKETCH_OPTIONS,
      fill: '#ede8dc',
      fillStyle: 'solid',
      strokeWidth: 1.2,
      roughness: 0.8,
    })
    svg.appendChild(node)
  }, [isActive])

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: W,
        height: H,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        fontFamily: "'Caveat', cursive",
        fontSize: 15,
        color: isActive ? '#2c2416' : '#5c4f3a',
        fontWeight: isActive ? 700 : 400,
        userSelect: 'none',
      }}
    >
      <svg
        ref={svgRef}
        width={W} height={H}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{engine.name}</span>
    </div>
  )
}

export function SearchEngineSelector({ selected, onChange }: SearchEngineSelectorProps) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const W = 62, H = 30

  // Draw sketchy button border
  useEffect(() => {
    const svg = btnRef.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    const node = rc.rectangle(1, 1, W - 2, H - 2, {
      ...SKETCH_OPTIONS,
      roughness: 1.2,
      strokeWidth: 1.5,
      fill: open ? '#ede8dc' : 'none',
      fillStyle: 'solid',
    })
    svg.appendChild(node)
  }, [open])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Draw dropdown panel border
  const panelRef = useRef<SVGSVGElement>(null)
  const PANEL_H = SEARCH_ENGINES.length * 32 + 8
  const PANEL_W = 148

  useEffect(() => {
    if (!open) return
    const svg = panelRef.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    const node = rc.rectangle(2, 2, PANEL_W - 4, PANEL_H - 4, {
      ...SKETCH_OPTIONS,
      fill: '#f5f0e8',
      fillStyle: 'solid',
      roughness: 1.0,
      strokeWidth: 1.8,
    })
    svg.appendChild(node)
  }, [open])

  return (
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0, WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Suchmaschine wählen"
        style={{
          position: 'relative',
          width: W,
          height: H,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Caveat', cursive",
          fontSize: 13,
          color: '#5c4f3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: 0,
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties}
      >
        <svg
          ref={btnRef}
          width={W} height={H}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
        <span style={{ position: 'relative', zIndex: 1, lineHeight: 1 }}>
          {selected.short} {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: H + 4,
          left: 0,
          zIndex: 1000,
          width: PANEL_W,
        }}>
          <svg
            ref={panelRef}
            width={PANEL_W} height={PANEL_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          />
          <div style={{ position: 'relative', zIndex: 1, padding: '4px 4px' }}>
            {SEARCH_ENGINES.map(engine => (
              <DropdownItem
                key={engine.id}
                engine={engine}
                isActive={engine.id === selected.id}
                onClick={() => { onChange(engine); setOpen(false) }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
