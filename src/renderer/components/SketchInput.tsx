import React, { KeyboardEvent, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import rough from 'roughjs'
import { SKETCH_OPTIONS } from '../sketch/roughConfig'

interface SketchInputProps {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  style?: React.CSSProperties
}

export interface SketchInputHandle {
  focus(): void
  selectAll(): void
}

const HEIGHT = 36

export const SketchInput = forwardRef<SketchInputHandle, SketchInputProps>(
  function SketchInput({ value, onChange, onKeyDown, placeholder, style }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus()
      },
      selectAll() {
        inputRef.current?.select()
      },
    }))

    useEffect(() => {
      const container = containerRef.current
      const svg = svgRef.current
      if (!container || !svg) return

      function draw() {
        const w = container!.offsetWidth
        const h = HEIGHT
        while (svg!.firstChild) svg!.removeChild(svg!.firstChild)
        svg!.setAttribute('width', String(w))
        svg!.setAttribute('height', String(h))
        const rc = rough.svg(svg!)
        const node = rc.rectangle(2, 2, w - 4, h - 4, { ...SKETCH_OPTIONS, roughness: 1.0, strokeWidth: 1.6 })
        svg!.appendChild(node)
      }

      draw()
      const ro = new ResizeObserver(draw)
      ro.observe(container)
      return () => ro.disconnect()
    }, [])

    return (
      <div
        ref={containerRef}
        style={{ position: 'relative', height: HEIGHT, flex: 1, minWidth: 0, ...style }}
      >
        <svg
          ref={svgRef}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Caveat', cursive",
            fontSize: '16px',
            color: '#2c2416',
            padding: '0 12px',
            boxSizing: 'border-box',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}
        />
      </div>
    )
  }
)
