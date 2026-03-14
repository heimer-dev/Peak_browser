import rough from 'roughjs'
import type { Options } from 'roughjs/bin/core'

export const SKETCH_OPTIONS: Options = {
  roughness: 1.4,
  bowing: 0.8,
  stroke: '#2c2416',
  strokeWidth: 1.8,
  fill: 'none',
  fillStyle: 'hachure',
  hachureGap: 6,
  seed: 42,
}

export const SKETCH_OPTIONS_ACTIVE: Options = {
  ...SKETCH_OPTIONS,
  strokeWidth: 2.4,
  roughness: 1.0,
}

export const SKETCH_OPTIONS_FILLED: Options = {
  ...SKETCH_OPTIONS,
  fill: '#f5f0e8',
  fillStyle: 'solid',
}

export const SKETCH_OPTIONS_DANGER: Options = {
  ...SKETCH_OPTIONS,
  stroke: '#c0392b',
}

export const SKETCH_OPTIONS_SUCCESS: Options = {
  ...SKETCH_OPTIONS,
  stroke: '#27ae60',
}

export function createRoughSVG(svgElement: SVGSVGElement) {
  return rough.svg(svgElement)
}
