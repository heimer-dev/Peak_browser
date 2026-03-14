import React from 'react'
import { useRoughSVG } from '../sketch/useRoughSVG'
import { SKETCH_OPTIONS, SKETCH_OPTIONS_ACTIVE } from '../sketch/roughConfig'

interface SketchButtonProps {
  label?: string
  icon?: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  width?: number
  height?: number
  title?: string
  className?: string
}

export function SketchButton({
  label, icon, onClick, active = false, disabled = false,
  width = 80, height = 36, title, className = ''
}: SketchButtonProps) {
  const shapes = [{ type: 'rect' as const, x: 2, y: 2, w: width - 4, h: height - 4 }]
  const options = active ? SKETCH_OPTIONS_ACTIVE : SKETCH_OPTIONS
  const svgRef = useRoughSVG(shapes, options)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`sketch-btn ${active ? 'active' : ''} ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        background: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Caveat', cursive",
        fontSize: '16px',
        color: disabled ? '#c4b8a0' : '#2c2416',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 0,
        WebkitAppRegion: 'no-drag',
      } as React.CSSProperties}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}{label}
      </span>
    </button>
  )
}
