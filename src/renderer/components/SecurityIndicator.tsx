import React, { useMemo } from 'react'
import { useRoughSVG } from '../sketch/useRoughSVG'
import type { SecurityStatus } from '../types'

interface SecurityIndicatorProps {
  status: SecurityStatus
  compact?: boolean
}

export function SecurityIndicator({ status, compact = false }: SecurityIndicatorProps) {
  const lockColor = status.isHttps ? '#27ae60' : '#c0392b'

  const lockShapes = useMemo(() => [
    { type: 'rect' as const, x: 5, y: 13, w: 22, h: 15 },   // lock body
    { type: 'path' as const, d: 'M 9 13 Q 9 4 16 4 Q 23 4 23 13' },  // shackle
    { type: 'ellipse' as const, cx: 16, cy: 20, rx: 3, ry: 3 },      // keyhole
  ], [])

  const svgRef = useRoughSVG(lockShapes, {
    stroke: lockColor,
    strokeWidth: 1.8,
    roughness: 1.2,
    seed: 7,
  })

  if (compact) {
    return (
      <svg
        ref={svgRef}
        width={32} height={32}
        title={status.isHttps ? 'Sichere Verbindung (HTTPS)' : 'Unsichere Verbindung!'}
        style={{ flexShrink: 0 }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg ref={svgRef} width={32} height={32} />
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 13, color: '#5c4f3a', lineHeight: 1.3 }}>
        {status.isHttps
          ? <span style={{ color: '#27ae60' }}>Sicher</span>
          : <span style={{ color: '#c0392b' }}>Nicht sicher!</span>
        }
        {status.adBlockActive && status.blockedRequestCount > 0 && (
          <span> · {status.blockedRequestCount} geblockt</span>
        )}
        {!status.jsEnabled && <span> · JS aus</span>}
      </div>
    </div>
  )
}
