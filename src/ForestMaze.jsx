import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, DoubleSide, Object3D } from 'three'
import { cellPosition, cellSize } from './levels'
import Landmarks from './Landmarks.jsx'
import { createTexture } from './textures'
import ShrubWalls from './ShrubWalls.jsx'
import AssetGrass from './AssetGrass'
import AssetBoundary from './MonsterAssetBoundary'

function Instances({ items, children, shadows = true }) {
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

function Grass({ items, reducedMotion }) {
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

function GroundMist({ level }) {
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
  return <group>{level.grid.flatMap((row, r) => row.map((cell, c) => {
    if (cell || (r * 3 + c) % 7 !== 0) return null
    const [x, z] = cellPosition(level, [r, c])
    return <sprite key={`mist-${r}-${c}`} position={[x, 0.45, z]} scale={[5, 0.9, 1]}>
      <spriteMaterial map={texture} color="#aec6bd" transparent opacity={0.17} depthWrite={false} />
    </sprite>
  }))}</group>
}

export default function ForestMaze({ level, mobile, reducedMotion }) {
  const soil = useMemo(() => createTexture('soil'), [])
  useEffect(() => () => soil.dispose(), [soil])
  const layout = useMemo(() => {
    const tiles = [], grass = []
    let seed = 391
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    level.grid.forEach((row, r) => row.forEach((cell, c) => {
      const [x, z] = cellPosition(level, [r, c])
      if (cell && !level.doors.some(door => door.cell[0] === r && door.cell[1] === c)) {
        tiles.push({ position: [x, 0, z], rotation: ((r + c) % 4) * Math.PI / 2 })
      } else if (!cell) {
        for (const [dr, dc] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
          if (level.grid[r + dr]?.[c + dc] !== 1) continue
          for (let i = 0; i < (mobile ? 2 : 4); i++) {
            const along = (random() - 0.5) * 1.85, edge = 0.68 + random() * 0.22
            const height = 0.45 + random() * 0.6
            grass.push({ position: [x + (dc ? dc * edge : along), height / 2, z + (dr ? dr * edge : along)], scale: [0.8 + random(), height, 1], rotation: [0, random() * Math.PI, (random() - 0.5) * 0.25], color: random() > 0.25 ? '#668065' : '#9a9c70' })
          }
        }
      }
    }))
    return { tiles, grass }
  }, [level, mobile])
  const width = level.grid[0].length * cellSize, depth = level.grid.length * cellSize
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[width + 16, depth + 16]} /><meshStandardMaterial color="#38463b" roughness={0.9} /></mesh>
    {level.grid.flatMap((row, r) => row.map((cell, c) => {
      if (cell) return null
      const [x, z] = cellPosition(level, [r, c])
      return <mesh key={`trail-${r}-${c}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, z]} receiveShadow>
        <planeGeometry args={[2, 2]} /><meshStandardMaterial map={soil} bumpMap={soil} bumpScale={0.035} color="#b4ae90" roughness={0.78} />
      </mesh>
    }))}
    <AssetBoundary fallback={null}>
      <Suspense fallback={null}><ShrubWalls tiles={layout.tiles} /></Suspense>
    </AssetBoundary>
    <AssetBoundary fallback={<Grass items={layout.grass} reducedMotion={reducedMotion} />}>
      <Suspense fallback={<Grass items={layout.grass} reducedMotion={reducedMotion} />}><AssetGrass items={layout.grass} reducedMotion={reducedMotion} /></Suspense>
    </AssetBoundary>
    <GroundMist level={level} />
    <Landmarks level={level} forest />
    {[level.start, level.end].map((cell, index) => {
      const [x, z] = cellPosition(level, cell)
      return <mesh key={index} position={[x, 0.018, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.42, 0.53, 24]} /><meshStandardMaterial color={index ? '#bbaa72' : '#8dac93'} roughness={0.9} /></mesh>
    })}
  </group>
}
