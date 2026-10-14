import { memo, useMemo } from 'react'
import { cellPosition, cellSize } from './levels'
import { canEscapeForest } from './journals'
import { Instances } from './ForestMaze'

function ForestExit({ level, collectedClues = [] }) {
  const [exitX, exitZ] = cellPosition(level, level.end)
  const ready = canEscapeForest(level, collectedClues)
  const edge = level.grid.length * cellSize / 2
  const foliage = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    position: [exitX + (i % 2 ? 1 : -1) * (2.2 + i % 3 * 0.5), 0.55, edge + 1 + Math.floor(i / 2) * 1.2],
    scale: [0.6, 0.7, 0.6], rotation: [0, i, 0], color: i % 3 ? '#4a654c' : '#6b7751',
  })), [exitX, edge])
  return <group>
    <group position={[exitX, 0, exitZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}><ringGeometry args={[1.1, 1.5, 32]} /><meshBasicMaterial color={ready ? '#b6e8c0' : '#aa9362'} /></mesh>
      <mesh position={[1.7, 1.6, 0]}><cylinderGeometry args={[0.07, 0.09, 3.2, 6]} /><meshStandardMaterial color="#413c2d" /></mesh>
      <mesh position={[1.7, 3.2, 0]}><boxGeometry args={[0.3, 0.45, 0.3]} /><meshBasicMaterial color={ready ? '#c5f4d4' : '#ffdfaa'} /></mesh>
      <pointLight position={[1.7, 3, 0]} color={ready ? '#c5f4d4' : '#ffdfaa'} intensity={ready ? 16 : 5} distance={7} />
    </group>
    <mesh position={[exitX, -0.03, edge + 9]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[22, 20]} /><meshStandardMaterial color="#52674b" roughness={1} /></mesh>
    <mesh position={[exitX, -0.015, edge + 8]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2.4, 18]} /><meshStandardMaterial color="#9d9674" roughness={1} /></mesh>
    <Instances items={foliage} shadows={false}><icosahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={1} /></Instances>
  </group>
}
export default memo(ForestExit)
