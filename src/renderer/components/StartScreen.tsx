import React, { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'

// Sketchy decorative line using ResizeObserver
function SketchHRule() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    function draw() {
      const w = container!.offsetWidth
      while (svg!.firstChild) svg!.removeChild(svg!.firstChild)
      svg!.setAttribute('width', String(w))
      svg!.setAttribute('height', '12')
      const rc = rough.svg(svg!)
      const node = rc.line(0, 6, w, 6, {
        stroke: '#c4b8a0',
        strokeWidth: 1.4,
        roughness: 1.8,
        bowing: 1.2,
        seed: 42,
      })
      svg!.appendChild(node)
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  )
}

// Wobbly circle decoration
function SketchCircle({ size, seed }: { size: number; seed: number }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    const node = rc.ellipse(size / 2, size / 2, size - 4, size - 4, {
      stroke: '#d4c9b0',
      strokeWidth: 1.2,
      roughness: 2.0,
      fill: 'none',
      seed,
    })
    svg.appendChild(node)
  }, [size, seed])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      style={{ position: 'absolute', pointerEvents: 'none', opacity: 0.5 }}
    />
  )
}

function Clock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const day = time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <div style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 72,
        fontWeight: 700,
        color: '#2c2416',
        lineHeight: 1,
        letterSpacing: '-2px',
      }}>
        {hours}:{minutes}
      </div>
      <div style={{
        fontFamily: "'Indie Flower', cursive",
        fontSize: 18,
        color: '#8c7f6a',
        marginTop: 4,
      }}>
        {day}
      </div>
    </div>
  )
}

export function StartScreen() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#f5f0e8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
    }}>
      {/* Background decoration circles */}
      <div style={{ position: 'absolute', top: -40, left: -40, pointerEvents: 'none' }}>
        <SketchCircle size={200} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: -60, right: -30, pointerEvents: 'none' }}>
        <SketchCircle size={280} seed={5} />
      </div>
      <div style={{ position: 'absolute', top: '30%', right: '8%', pointerEvents: 'none' }}>
        <SketchCircle size={120} seed={9} />
      </div>
      <div style={{ position: 'absolute', bottom: '20%', left: '6%', pointerEvents: 'none' }}>
        <SketchCircle size={90} seed={13} />
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 520, padding: '0 32px' }}>
        {/* Logo / Title */}
        <div style={{ marginBottom: 8, textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 52,
            fontWeight: 700,
            color: '#2c2416',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}>
            Peak
          </div>
          <div style={{
            fontFamily: "'Indie Flower', cursive",
            fontSize: 14,
            color: '#8c7f6a',
            marginTop: -2,
          }}>
            dein sicherer Browser
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', margin: '20px 0 28px' }}>
          <SketchHRule />
        </div>

        {/* Clock */}
        <Clock />

        {/* Hint */}
        <div style={{
          fontFamily: "'Indie Flower', cursive",
          fontSize: 15,
          color: '#8c7f6a',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          Gib eine Adresse oder Suchanfrage in der Leiste oben ein
        </div>

        {/* Divider */}
        <div style={{ width: '60%', margin: '28px 0' }}>
          <SketchHRule />
        </div>

        {/* Privacy badges */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '🛡️', label: 'Tracker geblockt' },
            { icon: '🔒', label: 'HTTPS erzwungen' },
            { icon: '🕵️', label: 'Privater Modus' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 14,
              color: '#5c4f3a',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
