const presets = Object.freeze({
  performance: Object.freeze({ dpr: 0.85, shadows: false, shadowSize: 256, grassClumps: 12, mistLayers: 6 }),
  balanced: Object.freeze({ dpr: 1, shadows: true, shadowSize: 512, grassClumps: 28, mistLayers: 10 }),
  high: Object.freeze({ dpr: 1.4, shadows: true, shadowSize: 1024, grassClumps: 45, mistLayers: 14 }),
})
export function graphicsPreset(quality, mobile = false) {
  return mobile ? presets.performance : presets[quality] || presets.balanced
}
