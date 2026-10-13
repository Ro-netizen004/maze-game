import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { cellPosition } from './levels'
import { getLandmarks } from './landmarks'

function drawPlaque(item) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 384
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#17222c'
  ctx.fillRect(0, 0, 512, 384)
  ctx.strokeStyle = item.color
  ctx.lineWidth = 10
  ctx.strokeRect(15, 15, 482, 354)
  ctx.fillStyle = item.color
  ctx.save()
  ctx.translate(256, 135)
  ctx.lineWidth = 10
  ctx.beginPath()
  if (item.symbol === 'sun' || item.symbol === 'moon') {
    ctx.arc(0, 0, 52, 0, Math.PI * 2)
    ctx.fill()
    if (item.symbol === 'moon') {
      ctx.fillStyle = '#17222c'
      ctx.beginPath()
      ctx.arc(24, -16, 48, 0, Math.PI * 2)
      ctx.fill()
    } else {
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(68, -5, 22, 10)
      }
    }
  } else if (item.symbol === 'eye') {
    ctx.ellipse(0, 0, 88, 45, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, 23, 0, Math.PI * 2)
    ctx.fill()
  } else {
    const points = item.symbol === 'star' ? 10 : item.symbol === 'diamond' ? 4 : 3
    for (let i = 0; i < points; i++) {
      const angle = i * Math.PI * 2 / points - Math.PI / 2
      const radius = item.symbol === 'star' && i % 2 ? 32 : 75
      ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff5df'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText(item.name, 256, 272, 440)
  ctx.fillStyle = item.color
  ctx.font = '24px monospace'
  ctx.fillText(`LANDMARK ${String(item.number).padStart(2, '0')}`, 256, 325)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function Plaque({ level, item, forest }) {
  const texture = useMemo(() => drawPlaque(item), [item])
  useEffect(() => () => texture.dispose(), [texture])
  const [x, z] = cellPosition(level, item.wallCell)
  const [nx, nz] = item.normal
  const face = level.theme === 'stone' ? 1 : level.theme === 'timber' ? 0.95 : 0.9
  return (
    <group position={[x + nx * (face + 0.045), 1.65, z + nz * (face + 0.045)]} rotation={[0, Math.atan2(nx, nz), 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1, 0.06]} />
        <meshStandardMaterial color={item.color} metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[1.23, 0.93]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
      {forest && <mesh position={[0, -0.85, -0.1]} castShadow><boxGeometry args={[0.15, 1.8, 0.15]} /><meshStandardMaterial color="#594f3b" roughness={1} /></mesh>}
    </group>
  )
}

export default function Landmarks({ level, forest = false }) {
  const items = useMemo(() => getLandmarks(level), [level])
  return <group>{items.map(item => <Plaque key={item.name} level={level} item={item} forest={forest} />)}</group>
}
