import { memo, Suspense, useEffect, useMemo } from 'react'
import { CanvasTexture, DoubleSide } from 'three'
import { cellPosition, cellSize } from './levels'
import { seededRandom } from './levelRuntime'
import { Instances, Grass, GroundMist } from './ForestMaze'
import RealisticTrees from './RealisticTrees'
import AssetGrass from './AssetGrass'
import AssetBoundary from './MonsterAssetBoundary'
import Landmarks from './Landmarks.jsx'
import { createTexture } from './textures'

function OpenForest({ level, mobile, reducedMotion, graphics }) {
  const soil = useMemo(() => {
    const texture = createTexture('soil')
    texture.repeat.set(38, 38)
    texture.anisotropy = 2
    return texture
  }, [])
  const trailFade = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')
    const fade = ctx.createRadialGradient(32, 32, 4, 32, 32, 32)
    fade.addColorStop(0, '#ffffffbb')
    fade.addColorStop(0.65, '#ffffff77')
    fade.addColorStop(1, '#ffffff00')
    ctx.fillStyle = fade; ctx.fillRect(0, 0, 64, 64)
    return new CanvasTexture(canvas)
  }, [])
  useEffect(() => () => trailFade.dispose(), [trailFade])
  const fernTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(64, 126); ctx.quadraticCurveTo(58, 52, 64, 5); ctx.stroke()
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 10; i++) {
      const y = 15 + i * 9, reach = 7 + Math.sin(i / 10 * Math.PI) * 40
      for (const side of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(64, y + 10)
        ctx.quadraticCurveTo(64 + side * reach * 0.4, y - 6, 64 + side * reach, y - 6)
        ctx.quadraticCurveTo(64 + side * reach * 0.7, y + 6, 64, y + 13)
        ctx.fill()
      }
    }
    return new CanvasTexture(canvas)
  }, [])
  useEffect(() => () => fernTexture.dispose(), [fernTexture])
  useEffect(() => () => soil.dispose(), [soil])
  const layout = useMemo(() => {
    const random = seededRandom(level.seed)
    const trees = [], bushes = [], grass = [], rocks = [], paths = [], moss = [], ferns = [], branches = []
    const size = level.grid.length * cellSize
    level.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (!cell) return
      const [x, z] = cellPosition(level, [r, c])
      trees.push({ position: [x, 0, z], scale: [1, 5 + random() * 3, 1] })
      rocks.push({ position: [x + 0.25, 0.3, z - 0.3], scale: [0.75, 0.6, 0.6], color: '#57645a' })
      bushes.push({ position: [x - 0.4, 0, z + 0.4], scale: [0.5, 0.7, 0.5] })
    }))
    // A treeline encloses a broad continuous clearing, with no hedge corridors.
    for (let i = 0; i < 40; i++) {
      const angle = i / 40 * Math.PI * 2
      const distance = size * 0.68 + random() * 2
      trees.push({ position: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance], scale: [1, 7 + random() * 3, 1] })
    }
    // Faint meandering footpaths are visual hints, never movement barriers.
    const sites = [level.start, ...level.clues.map(item => item.cell), level.end]
    for (let segment = 1; segment < sites.length; segment++) {
      const [ax, az] = cellPosition(level, sites[segment - 1]), [bx, bz] = cellPosition(level, sites[segment])
      const distance = Math.hypot(bx - ax, bz - az), count = Math.ceil(distance / 1.5)
      for (let i = 0; i <= count; i++) {
        const t = i / count, curve = Math.sin(t * Math.PI * 2) * 1.2
        paths.push({ position: [ax + (bx - ax) * t + curve, 0.02, az + (bz - az) * t], scale: [1.5, 1.2, 1], rotation: [-Math.PI / 2, 0, 0], color: '#aa9471' })
      }
    }
    for (const tree of trees.slice(0, 20)) moss.push({ position: [tree.position[0], 0.024, tree.position[2]], scale: [2.4, 1.8, 1], rotation: [-Math.PI / 2, 0, random() * 6], color: '#69865a' })
    // Cluster cheap fern cards at grove edges and around landmark clearings.
    for (const cell of level.clues.map(item => item.cell)) {
      const [x, z] = cellPosition(level, cell)
      for (let i = 0; i < (mobile ? 4 : 8); i++) {
        const angle = i * 2.399, radius = 2 + random()
        const height = 0.4 + random() * 0.35
        for (const yaw of [angle, angle + Math.PI / 2]) ferns.push({ position: [x + Math.cos(angle) * radius, height / 2, z + Math.sin(angle) * radius], scale: [0.7 + random() * 0.4, height, 1], rotation: [0, yaw, 0], color: i % 2 ? '#819d67' : '#5f8058' })
      }
    }
    for (const tree of trees.slice(0, 8)) branches.push({ position: [tree.position[0] + 1.3, 0.16, tree.position[2] + 0.8], scale: [0.13, 1.8, 0.13], rotation: [Math.PI / 2, 0, random() * Math.PI], color: '#544736' })
    for (let i = 0; i < (mobile ? 300 : 650); i++) {
      const x = (random() - 0.5) * size, z = (random() - 0.5) * size
      if ([level.start, level.end, ...level.clues.map(item => item.cell)].some(cell => {
        const [cx, cz] = cellPosition(level, cell)
        return Math.hypot(x - cx, z - cz) < 1.8
      })) continue
      const height = 0.18 + random() * 0.35
      grass.push({ position: [x, height / 2, z], scale: [1, height, 1], rotation: [0, random() * Math.PI, 0], color: random() > 0.5 ? '#82916b' : '#596f50' })
    }
    return { trees, bushes, grass, rocks, paths, moss, ferns, branches }
  }, [level, mobile])
  // Stable props prevent expensive geometry and shader rebuilds on HUD ticks.
  const importedGrass = useMemo(() => layout.grass.filter((_, i) => i % 5 === 0).slice(0, graphics.grassClumps), [layout, graphics.grassClumps])
  const width = level.grid[0].length * cellSize
  return <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width + 35, width + 35]} /><meshStandardMaterial color="#849077" map={soil} roughness={1} /></mesh>
    <Instances items={layout.paths} shadows={false}><planeGeometry args={[2, 2]} /><meshBasicMaterial map={trailFade} transparent opacity={0.35} depthWrite={false} /></Instances>
    <Instances items={layout.moss} shadows={false}><planeGeometry args={[2, 2]} /><meshBasicMaterial map={trailFade} transparent opacity={0.3} depthWrite={false} /></Instances>
    <AssetBoundary fallback={<Instances items={layout.trees}><coneGeometry args={[1.1, 8, 6]} /><meshStandardMaterial color="#304a34" /></Instances>}>
      <Suspense fallback={null}><RealisticTrees trees={layout.trees} bushes={layout.bushes} /></Suspense>
    </AssetBoundary>
    <Instances items={layout.rocks}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={1} /></Instances>
    <Grass items={layout.grass} reducedMotion={reducedMotion} />
    <Instances items={layout.ferns} shadows={false}><planeGeometry args={[1, 1]} /><meshStandardMaterial map={fernTexture} alphaTest={0.45} side={DoubleSide} roughness={1} /></Instances>
    <Instances items={layout.branches} shadows={false}><cylinderGeometry args={[1, 0.65, 1, 5]} /><meshStandardMaterial roughness={1} /></Instances>
    <AssetBoundary fallback={null}><Suspense fallback={null}><AssetGrass items={importedGrass} reducedMotion={reducedMotion} /></Suspense></AssetBoundary>
    <GroundMist level={level} maxLayers={graphics.mistLayers} />
    <Landmarks level={level} forest />
    {/* The moonlit pool and fallen stones make sites recognizable beyond their signs. */}
    <mesh position={[12, 0.014, 6]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.6, 32]} /><meshStandardMaterial color="#456570" metalness={0.4} roughness={0.15} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[-10 + side * 1.8, 1, 14]} rotation={[0, side * 0.2, side * -0.15]} castShadow><boxGeometry args={[0.7, 2, 0.7]} /><meshStandardMaterial color="#777c67" roughness={1} /></mesh>)}
    <mesh position={[-10, 0.4, 15.5]} rotation={[0.05, 0.25, 0.05]} castShadow><boxGeometry args={[3.5, 0.6, 0.8]} /><meshStandardMaterial color="#72785f" roughness={1} /></mesh>
    <mesh position={[-14.7, 0.18, -16.6]} rotation={[0, 0.3, 0]}><boxGeometry args={[0.65, 0.32, 1.4]} /><meshStandardMaterial color="#5e6955" roughness={1} /></mesh>
    <mesh position={[-13.3, 0.22, -16.6]} rotation={[Math.PI / 2, 0, 0.3]}><cylinderGeometry args={[0.22, 0.22, 0.75, 8]} /><meshStandardMaterial color="#706144" roughness={1} /></mesh>
  </group>
}
export default memo(OpenForest)
