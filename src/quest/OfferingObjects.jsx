import { cellPosition } from '../levels.js'
import { visibleOfferings } from './objectives.js'
import RelicModel from './RelicModel.jsx'
import { depositedOfferings } from './questInventory.js'

function RelicAppearance({ item, groundHeight, rotation = 0, active, reducedMotion }) {
  // The eye is centered on its origin; other exports have their base at zero.
  const height = groundHeight + (item.model === 'watcher-eye' ? 0.24 : 0)
  return <group position={[0, height, 0]} rotation={[0, rotation, 0]}>
    <RelicModel name={item.model} active={active} reducedMotion={reducedMotion} />
  </group>
}

function TrailOffering({ level, item, active, reducedMotion }) {
  const [x, z] = cellPosition(level, item.cell)
  return <group position={[x, 0, z]}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.38, 0.45, 0.5, 8]} />
      <meshStandardMaterial color="#384542" roughness={0.95} />
    </mesh>
    <RelicAppearance item={item} groundHeight={item.model === 'watcher-eye' ? 0.54 : 0.52}
      rotation={item.rotation} active={active} reducedMotion={reducedMotion} />
    <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.26, 0.34, 16]} />
      <meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.7} />
    </mesh>
  </group>
}

function RitualOffering({ level, item, active, reducedMotion }) {
  const shrine = level.shrines.find(shrine => shrine.id === item.rune)
  const [x, z] = cellPosition(level, shrine.cell)
  const rotation = Math.atan2(shrine.entrance[1] - shrine.cell[1], shrine.entrance[0] - shrine.cell[0])
  const offset = item.model === 'ritual-candle' ? 0.55 : -0.55
  return <group position={[x + offset, 0, z]}>
    <RelicAppearance item={item} groundHeight={0.3} rotation={rotation} active={active} reducedMotion={reducedMotion} />
  </group>
}

export default function OfferingObjects({ level, collectedOfferings, openedDoors, activatedShrines, active, reducedMotion }) {
  const visible = visibleOfferings(level, openedDoors, activatedShrines, collectedOfferings)
  const deposited = depositedOfferings(level, activatedShrines)
  return <group>
    {visible.map(item => <TrailOffering key={item.id} level={level} item={item} active={active} reducedMotion={reducedMotion} />)}
    {deposited.map(item => <RitualOffering key={item.id} level={level} item={item} active={active} reducedMotion={reducedMotion} />)}
  </group>
}
