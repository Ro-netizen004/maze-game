import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

function createPositions(count) {
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index++) {
    const offset = index * 3
    positions[offset] = (Math.random() - 0.5) * 24
    positions[offset + 1] = Math.random() * 5 - 1
    positions[offset + 2] = (Math.random() - 0.5) * 24
  }
  return positions
}

export default function EnvironmentalDust({ mobile = false, reducedMotion = false, active = true, flashlightOn = true }) {
  const points = useRef(null)
  const material = useRef(null)
  const { camera } = useThree()
  const count = reducedMotion ? 18 : mobile ? 36 : 90
  const positions = useMemo(() => createPositions(count), [count])
  const uniforms = useMemo(() => ({
    eye: { value: new Vector3() }, direction: { value: new Vector3() },
    power: { value: 1 }, pixelRatio: { value: mobile ? 1 : 1.5 },
  }), [mobile])

  useFrame((_, delta) => {
    if (!points.current) return
    points.current.position.x = camera.position.x
    points.current.position.z = camera.position.z
    if (material.current) {
      material.current.uniforms.eye.value.copy(camera.position)
      camera.getWorldDirection(material.current.uniforms.direction.value)
      material.current.uniforms.power.value = flashlightOn ? 1 : 0
    }
    if (active && !reducedMotion) points.current.rotation.y += Math.min(delta, 0.05) * 0.018
  })

  return <points ref={points} frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
    </bufferGeometry>
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false}
      vertexShader={`
        uniform vec3 eye; uniform vec3 direction; uniform float power; uniform float pixelRatio;
        varying float glow;
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vec3 offset = world.xyz - eye;
          float distanceToEye = length(offset);
          float cone = smoothstep(0.78, 0.96, dot(normalize(offset), direction));
          glow = power * cone * (1.0 - smoothstep(2.0, 10.0, distanceToEye));
          vec4 view = viewMatrix * world;
          gl_Position = projectionMatrix * view;
          gl_PointSize = clamp(14.0 * pixelRatio / max(0.5, -view.z), 1.0, 5.0);
        }`}
      fragmentShader={`
        varying float glow;
        void main() {
          float radius = length(gl_PointCoord - vec2(0.5));
          float alpha = (1.0 - smoothstep(0.05, 0.5, radius)) * glow * 0.28;
          if (alpha < 0.005) discard;
          gl_FragColor = vec4(0.72, 0.87, 0.9, alpha);
        }`} />
  </points>
}
