import { useEffect, useRef, RefObject } from 'react'
import type { Options } from 'roughjs/bin/core'
import { createRoughSVG, SKETCH_OPTIONS } from './roughConfig'

export type Shape =
  | { type: 'rect'; x: number; y: number; w: number; h: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { type: 'path'; d: string }

export function useRoughSVG(
  shapes: Shape[],
  options: Partial<Options> = {}
): RefObject<SVGSVGElement | null> {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const rc = createRoughSVG(svg)
    const merged: Options = { ...SKETCH_OPTIONS, ...options }

    for (const shape of shapes) {
      let node: SVGGElement | null = null
      if (shape.type === 'rect') {
        node = rc.rectangle(shape.x, shape.y, shape.w, shape.h, merged)
      } else if (shape.type === 'line') {
        node = rc.line(shape.x1, shape.y1, shape.x2, shape.y2, merged)
      } else if (shape.type === 'ellipse') {
        node = rc.ellipse(shape.cx, shape.cy, shape.rx * 2, shape.ry * 2, merged)
      } else if (shape.type === 'path') {
        node = rc.path(shape.d, merged)
      }
      if (node) svg.appendChild(node)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(shapes), JSON.stringify(options)])

  return svgRef
}
