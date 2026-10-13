import { Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Object3D } from 'three'
import { FLASHLIGHT_LOW_THRESHOLD } from './flashlightBattery'
import FlashlightModel from './FlashlightModel'
import AssetBoundary from './MonsterAssetBoundary'

function HeldFlashlight({ on }) {
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.038, 0.038, 0.28, 20]} />
      <meshStandardMaterial color="#18232a" emissive="#526570" emissiveIntensity={0.12} metalness={0.65} roughness={0.32} />
    </mesh>
    {[-0.1, -0.065, 0.095].map(z => <mesh key={z} position={[0, 0, z]}><torusGeometry args={[0.039, 0.003, 6, 20]} /><meshBasicMaterial color="#52616a" /></mesh>)}
    <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.04, 0.065, 0.1, 20]} />
      <meshStandardMaterial color="#687c86" emissive="#52616a" emissiveIntensity={0.12} metalness={0.8} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0, -0.234]} rotation={[0, Math.PI, 0]}><circleGeometry args={[0.055, 20]} /><meshBasicMaterial color={on ? '#fff0c9' : '#4b5052'} /></mesh>
    <mesh position={[0, 0, -0.232]}><torusGeometry args={[0.059, 0.005, 6, 20]} /><meshBasicMaterial color="#6b7881" /></mesh>
    <mesh position={[0, 0, 0.145]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.039, 0.039, 0.015, 20]} /><meshBasicMaterial color="#202a33" /></mesh>
  </group>
}

export default function Flashlight({
  intensity = 65,
  battery = 100,
  on = true,
  mobile = false,
  reducedMotion = false,
  active = true,
}) {
  const { camera } = useThree()
  const light = useRef(null)
  const spill = useRef(null)
  const flickerTime = useRef(0)
  const target = useMemo(() => {
    const object = new Object3D()
    object.position.set(0.084, -0.064, -12.89)
    return object
  }, [])
  const available = on && battery > 0
  const batteryScale = Math.max(0.68, Math.min(1, battery / FLASHLIGHT_LOW_THRESHOLD))

  useFrame((_, delta) => {
    if (!light.current) return
    if (active) flickerTime.current += Math.min(delta, 0.05)
    let flicker = 1
    if (available && battery <= FLASHLIGHT_LOW_THRESHOLD && !reducedMotion) {
      const pulse = Math.sin(flickerTime.current * 31) + Math.sin(flickerTime.current * 17.3)
      if (pulse > 1.7) flicker = 0.72
      else flicker = 0.94 + Math.sin(flickerTime.current * 7) * 0.04
    }
    const power = available ? intensity * batteryScale * flicker : 0
    light.current.intensity = power * 0.75
    if (spill.current) spill.current.intensity = power * 0.38
  })

  // Camera children have fixed local transforms, independent of frame ordering.
  return <primitive object={camera} dispose={null}>
    <group position={[0.25, -0.25, -0.7]}>
      <AssetBoundary fallback={<HeldFlashlight on={available} />}>
        <Suspense fallback={<HeldFlashlight on={available} />}><FlashlightModel on={available} /></Suspense>
      </AssetBoundary>
    </group>
    <primitive object={target} />
    <spotLight ref={light} position={[0.25, -0.25, -0.9]} target={target} color="#fff2dc" intensity={available ? intensity * 0.75 : 0}
      distance={23} angle={0.56} penumbra={0.95} decay={2} castShadow
      shadow-mapSize={[mobile ? 512 : 1024, mobile ? 512 : 1024]} shadow-camera-near={0.05} shadow-camera-far={20}
      shadow-bias={-0.0001} shadow-normalBias={0.015} />
    <spotLight ref={spill} position={[0.25, -0.25, -0.9]} target={target} color="#d9e9ee" intensity={available ? intensity * 0.38 : 0}
      distance={14} angle={1.05} penumbra={1} decay={2}
      shadow-mapSize={[256, 256]} shadow-camera-near={0.05} shadow-camera-far={14}
      shadow-bias={-0.0001} shadow-normalBias={0.025} />
  </primitive>
}

