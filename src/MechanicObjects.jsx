import { cellPosition } from './levels'

function Marker({ cell, level, children }) {
  const [x, z] = cellPosition(level, cell)
  return <group position={[x, 0, z]}>{children}</group>
}

export default function MechanicObjects({ level, triggeredTraps = [], activatedShrines = [] }) {
  return (
    <group>
      {level.hidingSpots.map(spot => (
        <Marker key={spot.id} level={level} cell={spot.cell}>
          <mesh castShadow position={[0, 0.75, 0]}>
            <boxGeometry args={[1.25, 1.5, 1.25]} />
            <meshStandardMaterial color={spot.type === 'shadow' ? '#262039' : '#51483f'} roughness={0.95} transparent opacity={spot.type === 'alcove' ? 0.72 : 1} />
          </mesh>
        </Marker>
      ))}
      {level.traps.map(trap => (
        <Marker key={trap.id} level={level} cell={trap.cell}>
          <mesh receiveShadow position={[0, 0.025, 0]}>
            <boxGeometry args={[1.2, 0.05, 1.2]} />
            <meshStandardMaterial color={triggeredTraps.includes(trap.id) ? '#dc3d32' : '#655f57'} emissive={triggeredTraps.includes(trap.id) ? '#5b0905' : '#000000'} />
          </mesh>
        </Marker>
      ))}
      {level.noisyZones.map(zone => (
        <Marker key={zone.id} level={level} cell={zone.cell}>
          <mesh receiveShadow position={[0, 0.018, 0]}>
            <ringGeometry args={[0.35, 0.8, 16]} />
            <meshStandardMaterial color="#d89445" roughness={0.8} />
          </mesh>
        </Marker>
      ))}
      {level.shrines.map(shrine => (
        <Marker key={shrine.id} level={level} cell={shrine.cell}>
          <mesh castShadow position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.32, 0.48, 1.1, 6]} />
            <meshStandardMaterial color={shrine.color} emissive={activatedShrines.includes(shrine.id) ? shrine.color : '#17131e'} emissiveIntensity={0.7} />
          </mesh>
        </Marker>
      ))}
    </group>
  )
}
