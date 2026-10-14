import { Suspense, useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from './MonsterAssetBoundary'
import { cellPosition } from './levels'

function RitualModel({ active }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/ritual-circle/ritual-circle.glb`)
  const { model, materials } = useMemo(() => {
    const model = gltf.scene.clone(true), materials = []
    const box = new Box3().setFromObject(model), size = box.getSize(new Vector3())
    const scale = 3.2 / Math.max(size.x, size.z)
    const heightScale = Math.min(scale, 0.24 / size.y)
    const center = box.getCenter(new Vector3())
    model.scale.set(scale, heightScale, scale)
    model.position.set(-center.x * scale, -box.min.y * heightScale + 0.02, -center.z * scale)
    model.traverse(node => {
      if (!node.isMesh) return
      node.material = node.material.clone()
      node.material.roughness = 0.9
      node.material.emissiveMap = node.material.map
      node.material.emissive.set('#5ca795')
      node.receiveShadow = true
      node.castShadow = false
      materials.push(node.material)
    })
    return { model, materials }
  }, [gltf.scene])
  useEffect(() => {
    materials.forEach(material => { material.emissiveIntensity = active ? 1.3 : 0.18 })
  }, [active, materials])
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  return <primitive object={model} dispose={null} />
}

function RitualFallback() {
  return <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[1.6, 1.6, 0.24, 24]} /><meshStandardMaterial color="#465549" roughness={1} /></mesh>
}

export default function RitualCircle({ level, ritual, active }) {
  const [x, z] = cellPosition(level, ritual.cell)
  const glyph = useMemo(() => {
    const vertices = []
    for (let i = 0; i < 5; i++) {
      for (const point of [i, (i + 2) % 5]) {
        const angle = point * Math.PI * 2 / 5 - Math.PI / 2
        vertices.push(Math.cos(angle) * 1.05, 0.285, Math.sin(angle) * 1.05)
      }
    }
    return new Float32Array(vertices)
  }, [])
  const glow = active ? '#91ffe0' : '#5caaa0'
  return <group position={[x, 0, z]}>
    <AssetBoundary fallback={<RitualFallback />}><Suspense fallback={<RitualFallback />}><RitualModel active={active} /></Suspense></AssetBoundary>
    <mesh position={[0, 0.285, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.48, 1.54, 48]} /><meshBasicMaterial color={glow} toneMapped={false} /></mesh>
    <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[glyph, 3]} /></bufferGeometry><lineBasicMaterial color={glow} toneMapped={false} /></lineSegments>
    <mesh position={[0, active ? 1.4 : 1.05, 0]}><octahedronGeometry args={[active ? 0.18 : 0.12, 0]} /><meshBasicMaterial color={glow} toneMapped={false} /></mesh>
    {active && <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.35, 1.35, 1.8, 16, 1, true]} /><meshBasicMaterial color="#6cf4cf" transparent opacity={0.07} depthWrite={false} toneMapped={false} /></mesh>}
  </group>
}
