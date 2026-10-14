import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide } from 'three'
import { seededRandom } from './levelRuntime'

// A camera-centered sky keeps distant scenery consistent without large assets.
export default function ForestSky() {
  const group = useRef(null)
  const stars = useMemo(() => {
    const random = seededRandom('forest-sky')
    const positions = new Float32Array(90 * 3)
    for (let i = 0; i < 90; i++) {
      const angle = random() * Math.PI * 2, y = 0.3 + random() * 0.65
      const radius = Math.sqrt(1 - y * y)
      positions.set([Math.cos(angle) * radius * 43, y * 43, Math.sin(angle) * radius * 43], i * 3)
    }
    return positions
  }, [])
  useFrame(({ camera }) => { group.current.position.copy(camera.position) })
  return <group ref={group}>
    <mesh renderOrder={-100}>
      <sphereGeometry args={[44, 16, 12]} />
      <shaderMaterial side={BackSide} depthWrite={false}
        vertexShader={'varying float height; void main(){ height = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'}
        fragmentShader={'varying float height; void main(){ vec3 horizon = vec3(0.125, 0.208, 0.212); vec3 zenith = vec3(0.035, 0.065, 0.105); gl_FragColor = vec4(mix(horizon, zenith, smoothstep(0.0, 0.8, height)), 1.0); }'} />
    </mesh>
    <points renderOrder={-99}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry>
      <pointsMaterial color="#b9cdc8" size={0.065} transparent opacity={0.55} depthWrite={false} fog={false} />
    </points>
    <mesh position={[11, 22, 32]}><sphereGeometry args={[0.85, 16, 8]} /><meshBasicMaterial color="#d5dfd6" fog={false} /></mesh>
  </group>
}
