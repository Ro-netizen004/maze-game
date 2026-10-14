import { cellPosition } from './levels.js'
import { visibleOfferings } from './objectives.js'
import WatcherEye from './WatcherEye.jsx'
import RelicModel from './RelicModel.jsx'
import { depositedOfferings } from './questInventory.js'

export default function OfferingObjects({ level, collectedOfferings, openedDoors, activatedShrines, active, reducedMotion }) {
  return <group>{visibleOfferings(level,openedDoors,activatedShrines,collectedOfferings).map(item => {
    const [x, z] = cellPosition(level, item.cell)
    return <group key={item.id} position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.38, 0.45, 0.5, 8]} /><meshStandardMaterial color="#384542" roughness={0.95} /></mesh>
      {item.model === 'watcher-eye' ? <WatcherEye available rotation={item.rotation} /> : <group position={[0,0.52,0]} rotation={[0,item.rotation,0]}><RelicModel name={item.model} active={active} reducedMotion={reducedMotion} /></group>}
      <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.26, 0.34, 16]} /><meshStandardMaterial color={item.color} emissive={item.color} emissiveIntensity={0.7} /></mesh>
    </group>
  })}{depositedOfferings(level,activatedShrines).map(item=>{
    const shrine = level.shrines.find(shrine=>shrine.id===item.rune)
    const [x,z] = cellPosition(level,shrine.cell)
    const rotation = Math.atan2(shrine.entrance[1]-shrine.cell[1],shrine.entrance[0]-shrine.cell[0])
    return <group key={item.id} position={[x+(item.model==='ritual-candle'?0.55:-0.55),0.3,z]} rotation={[0,rotation,0]}>
      {item.model==='watcher-eye' ? <WatcherEye available rotation={0} height={0.24} /> : <RelicModel name={item.model} active={active} reducedMotion={reducedMotion} />}
    </group>
  })}</group>
}
