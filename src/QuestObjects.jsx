import { Suspense } from 'react'
import { cellPosition } from './levels'
import BookModel from './BookModel'
import AssetBoundary from './MonsterAssetBoundary'

export default function QuestObjects({ level, collectedClues = [] }) {
  return <group>{level.clues.filter(item => !collectedClues.includes(item.id)).map(item => {
    const [x, z] = cellPosition(level, item.cell)
    return <group key={item.id} position={[x, 0, z]}>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.35, 0.43, 0.7, 9]} /><meshStandardMaterial color="#584837" roughness={1} /></mesh>
      <AssetBoundary fallback={null}><Suspense fallback={null}><group position={[0, 0.72, 0]} rotation={[0, 0.3, 0]}><BookModel /></group></Suspense></AssetBoundary>
      <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.36, 0.44, 24]} /><meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.6} /></mesh>
    </group>
  })}</group>
}
