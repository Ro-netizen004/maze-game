import { cellPosition, cellSize } from './levels'
import { Suspense, useMemo } from 'react'
import RealisticTrees from './RealisticTrees'
import AssetBoundary from './MonsterAssetBoundary'
import ForestRoad from './ForestRoad'

function Tree({ position, scale, color }) {
  return <group position={position} scale={scale}>
    <mesh castShadow position={[0, 1.2, 0]}><cylinderGeometry args={[0.14, 0.22, 2.4, 6]} /><meshStandardMaterial color="#73503b" /></mesh>
    {[2.2, 3, 3.7].map((y, i) => <mesh key={y} castShadow position={[0, y, 0]}><coneGeometry args={[1.4 - i * 0.3, 2.2, 7]} /><meshStandardMaterial color={color} roughness={1} /></mesh>)}
  </group>
}
export default function ForestExit({ level }) {
  const [exitX] = cellPosition(level, level.end)
  const edge = level.grid.length * cellSize / 2
  const trees = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    position: [exitX + (i % 2 ? 1 : -1) * (3.3 + Math.floor(i / 2) % 3 * 2.3), 0, edge + 2.5 + Math.floor(i / 2) * 1.3],
    scale: [1, 4.8 + i % 4 * 0.6, 1],
  })), [exitX, edge])
  const bushes = useMemo(() => [], [])
  return <group>
    <mesh receiveShadow position={[0, -0.03, edge + 12]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[70, 24]} /><meshStandardMaterial color="#7dac56" /></mesh>
    <mesh receiveShadow position={[exitX, -0.015, edge + 7]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 14]} /><meshStandardMaterial color="#e5cd91" /></mesh>
    <AssetBoundary fallback={<Suspense fallback={null}><RealisticTrees trees={trees} bushes={bushes} /></Suspense>}>
      <Suspense fallback={trees.map((item, i) => <Tree key={i} position={item.position} scale={1} color="#386d44" />)}><ForestRoad position={[exitX, 0, edge + 1.2]} /></Suspense>
    </AssetBoundary>
    {Array.from({ length: 24 }, (_, i) => <group key={i} position={[exitX + (i % 2 ? 1 : -1) * (1.5 + i % 3 * 0.2), 0, edge + 0.8 + Math.floor(i / 2) * 0.7]}>
      <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.015, 0.015, 0.3, 4]} /><meshStandardMaterial color="#397546" /></mesh>
      <mesh position={[0, 0.32, 0]}><icosahedronGeometry args={[0.11, 0]} /><meshStandardMaterial color={i % 3 ? '#fff2b0' : '#f39cba'} /></mesh>
    </group>)}
    <mesh position={[exitX + 1.3, 8, edge + 18]}><sphereGeometry args={[0.7, 16, 12]} /><meshBasicMaterial color="#63718a" /></mesh>
  </group>
}
