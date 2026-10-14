import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, DoubleSide, Object3D } from 'three'
import { cellPosition } from '../world/levels.js'

export function Instances({ items, children, shadows = true }) {
  const mesh = useRef(null)
  useLayoutEffect(() => {
    if (!items.length || !mesh.current) return
    const transform = new Object3D(), color = new Color()
    items.forEach((item, index) => {
      transform.position.set(...item.position)
      transform.rotation.set(...(item.rotation || [0, 0, 0]))
      transform.scale.set(...item.scale)
      transform.updateMatrix()
      mesh.current.setMatrixAt(index, transform.matrix)
      mesh.current.setColorAt(index, color.set(item.color || '#ffffff'))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [items])
  if (!items.length) return null
  return <instancedMesh ref={mesh} args={[null, null, items.length]} castShadow={shadows} receiveShadow>{children}</instancedMesh>
}

export function Grass({ items, reducedMotion }) {
  const material = useRef(null)
  useFrame(({ clock }) => {
    const shader = material.current?.userData.shader
    if (shader) shader.uniforms.forestTime.value = reducedMotion ? 0 : clock.elapsedTime
  })
  return <Instances items={items} shadows={false}>
    <planeGeometry args={[0.065, 1, 1, 3]} />
    <meshStandardMaterial ref={material} color="#ffffff" side={DoubleSide} roughness={0.95}
      onBeforeCompile={shader => {
        shader.uniforms.forestTime = { value: 0 }
        shader.vertexShader = `uniform float forestTime;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          float tip = position.y + 0.5;
          transformed.x *= 1.0 - tip * 0.96;
          float wind = sin(forestTime * 1.2 + instanceMatrix[3].x * 0.8 + instanceMatrix[3].z * 0.6);
          transformed.x += wind * tip * tip * 0.10;
        `)
        material.current.userData.shader = shader
      }} />
  </Instances>
}

export function GroundMist({ level, maxLayers = 14 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')
    const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.65)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.25)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    return new CanvasTexture(canvas)
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  const cells = useMemo(() => {
    const candidates = level.grid.flatMap((row, r) => row.flatMap((cell, c) => !cell && (r * 3 + c) % 7 === 0 ? [[r, c]] : []))
    return candidates.filter((_, index) => index % Math.ceil(candidates.length / maxLayers) === 0).slice(0, maxLayers)
  }, [level, maxLayers])
  return <group>{cells.map(([r, c]) => {
    const [x, z] = cellPosition(level, [r, c])
    return <sprite key={`mist-${r}-${c}`} position={[x, 0.45, z]} scale={[7, 0.8, 1]}>
      <spriteMaterial map={texture} color="#aec6bd" transparent opacity={0.12} depthWrite={false} />
    </sprite>
  })}</group>
}
