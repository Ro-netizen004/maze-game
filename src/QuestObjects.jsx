import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { cellPosition, doorPosition } from './levels'

function Key({ position, color }) {
  const ref = useRef(null)
  useFrame(({ clock }, delta) => {
    ref.current.rotation.y += delta
    ref.current.position.y = 1 + Math.sin(clock.elapsedTime * 2) * 0.12
  })
  const material = <meshStandardMaterial color={color} metalness={0.3} roughness={0.3} />
  return (
    <group ref={ref} position={[position[0], 1, position[1]]}>
      <mesh position={[0, 0.22, 0]}><torusGeometry args={[0.18, 0.055, 8, 20]} />{material}</mesh>
      <mesh position={[0, -0.12, 0]}><boxGeometry args={[0.08, 0.4, 0.08]} />{material}</mesh>
      {[-0.2, -0.32].map(y => <mesh key={y} position={[0.08, y, 0]}><boxGeometry args={[0.2, 0.07, 0.08]} />{material}</mesh>)}
    </group>
  )
}

export default function QuestObjects({ level, collectedKeys, openedDoors }) {
  return (
    <group>
      {level.keys.filter(key => !collectedKeys.includes(key.id)).map(key => <Key key={key.id} position={cellPosition(level, key.cell)} color={key.color} />)}
      {level.doors.map(door => {
        const [x, z] = doorPosition(level, door)
        return <group key={door.id} position={[x, 0, z]} rotation={[0, door.axis === 'x' ? Math.PI / 2 : 0, 0]}>
        {[-0.94, 0.94].map(offset => (
          <mesh key={offset} castShadow position={[offset, 1.5, 0]}>
            <boxGeometry args={[0.2, 3, 0.45]} />
            <meshStandardMaterial color="#59685c" roughness={0.95} />
          </mesh>
        ))}
        <mesh castShadow position={[0, 2.95, 0]}><boxGeometry args={[2.15, 0.24, 0.48]} /><meshStandardMaterial color="#677566" roughness={0.95} /></mesh>
        {!openedDoors.includes(door.id) && (
          <group>
            <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
              <boxGeometry args={[1.76, 2.8, 0.3]} />
              <meshStandardMaterial color={level.theme === 'temple' ? '#5e5472' : '#69452d'} roughness={0.8} />
            </mesh>
            {[0.5, 2.2].map(y => <mesh key={y} position={[0, y, -0.17]}><boxGeometry args={[1.76, 0.12, 0.04]} /><meshStandardMaterial color="#292e35" metalness={0.7} roughness={0.4} /></mesh>)}
            {[-0.21, 0.21].map(z => <mesh key={z} position={[0.5, 1.3, z]}><boxGeometry args={[0.22, 0.28, 0.1]} /><meshStandardMaterial color={door.color} metalness={0.3} roughness={0.3} /></mesh>)}
            {[-0.17, 0.17].map(z => <mesh key={z} position={[0, 2.5, z]}><boxGeometry args={[1.7, 0.12, 0.04]} /><meshStandardMaterial color={door.color} /></mesh>)}
          </group>
        )}
      </group>
      })}
    </group>
  )
}
