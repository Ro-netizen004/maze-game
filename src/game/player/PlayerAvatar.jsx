import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Block({ position, size, color }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
}

// Pose is a mutable ref so future remote-player updates won't rerender every frame.
export default function PlayerAvatar({ pose, local = false, shirt = '#517b73', pants = '#344957' }) {
  const root = useRef(null), leftArm = useRef(null), rightArm = useRef(null)
  const leftLeg = useRef(null), rightLeg = useRef(null), phase = useRef(0)
  useFrame((_, delta) => {
    const player = pose.current
    if (!player || !root.current) return
    root.current.position.set(player.x, player.y, player.z)
    root.current.rotation.y = player.yaw
    phase.current += Math.min(delta, 0.05) * (player.sprinting ? 11 : 7)
    const swing = player.moving ? Math.sin(phase.current) * 0.4 : 0
    leftArm.current.rotation.x = -swing
    rightArm.current.rotation.x = swing
    leftLeg.current.rotation.x = swing
    rightLeg.current.rotation.x = -swing
  })
  // Hide the local body in first person, including its shadow, to avoid clipping.
  return <group ref={root} visible={!local}>
    <Block position={[0, 1.04, 0]} size={[0.52, 0.62, 0.28]} color={shirt} />
    <Block position={[0, 1.57, 0]} size={[0.38, 0.38, 0.36]} color="#d4b589" />
    {[-0.08, 0.08].map(x => <Block key={x} position={[x, 1.59, 0.185]} size={[0.04, 0.04, 0.01]} color="#293338" />)}
    <Block position={[0, 1.48, 0.185]} size={[0.12, 0.018, 0.01]} color="#293338" />
    <group ref={leftArm} position={[-0.36, 1.3, 0]}><Block position={[0, -0.29, 0]} size={[0.18, 0.6, 0.24]} color={shirt} /></group>
    <group ref={rightArm} position={[0.36, 1.3, 0]}><Block position={[0, -0.29, 0]} size={[0.18, 0.6, 0.24]} color={shirt} /></group>
    <group ref={leftLeg} position={[-0.14, 0.73, 0]}><Block position={[0, -0.35, 0]} size={[0.22, 0.7, 0.26]} color={pants} /></group>
    <group ref={rightLeg} position={[0.14, 0.73, 0]}><Block position={[0, -0.35, 0]} size={[0.22, 0.7, 0.26]} color={pants} /></group>
  </group>
}
