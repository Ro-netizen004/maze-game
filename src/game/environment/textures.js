import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Small, seamless textures drawn locally; no image downloads needed.
export function createTexture(kind) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (kind === 'soil') {
    ctx.fillStyle = '#7c7865'
    ctx.fillRect(0, 0, 256, 256)
    let seed = 29
    for (let i = 0; i < 9000; i++) {
      seed = (seed * 16807) % 2147483647
      const x = seed % 256
      seed = (seed * 16807) % 2147483647
      const y = seed % 256
      ctx.fillStyle = i % 3 ? 'rgba(34,43,31,0.16)' : 'rgba(210,207,165,0.2)'
      ctx.fillRect(x, y, i % 5 === 0 ? 3 : 1, 1)
    }
  } else if (kind === 'wood') {
    ctx.fillStyle = '#bfa483'
    ctx.fillRect(0, 0, 256, 256)
    for (let x = 0; x < 256; x += 4) {
      ctx.strokeStyle = `rgba(60,35,15,${0.08 + (x % 7) * 0.025})`
      ctx.beginPath()
      ctx.moveTo(x, 0)
      for (let y = 0; y <= 256; y += 8) ctx.lineTo(x + Math.sin(y * Math.PI / 64 + x) * 2, y)
      ctx.stroke()
    }
    for (let x = 0; x < 256; x += 64) {
      ctx.fillStyle = '#59422f'
      ctx.fillRect(x, 0, 2, 256)
    }
  } else {
  ctx.fillStyle = '#45413b'
  ctx.fillRect(0, 0, 256, 256)
  const rows = kind === 'brick' ? 8 : 4
  const columns = 4
  const h = 256 / rows
  const w = 256 / columns
  for (let r = 0; r < rows; r++) {
    const offset = kind === 'brick' && r % 2 ? w / 2 : 0
    for (let c = -1; c < columns; c++) {
      const shade = 145 + ((r * 17 + c * 23 + 256) % 35)
      ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 12})`
      ctx.fillRect(c * w + offset + 2, r * h + 2, w - 4, h - 4)
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.strokeRect(c * w + offset + 3, r * h + 3, w - 6, h - 6)
    }
  }
  // Deterministic grain keeps each texture stable between renders.
  let seed = 7
  for (let i = 0; i < 16000; i++) {
    seed = (seed * 16807) % 2147483647
    const x = seed % 256
    seed = (seed * 16807) % 2147483647
    const y = seed % 256
    ctx.fillStyle = i % 2 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.09)'
    ctx.fillRect(x, y, 1, 1)
  }
  }
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
