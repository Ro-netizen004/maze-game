import { Suspense, useEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from './MonsterAssetBoundary.jsx'

function EyeModel({ available }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/watcher-eye/watcher-eye.glb`)
  const { model, materials } = useMemo(() => {
    const model = gltf.scene.clone(true), materials = []
    model.traverse(node => {
      if (!node.isMesh) return
      node.material = node.material.clone()
      materials.push(node.material)
    })
    return { model, materials }
  }, [gltf.scene])
  useEffect(() => {
    materials.forEach(material => { material.emissiveIntensity = available ? 0.35 : 0.12 })
  }, [available, materials])
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  return <primitive object={model} dispose={null} />
}

function EyeFallback() {
  return <mesh><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#dbd4c5" roughness={0.35} /></mesh>
}

export default function WatcherEye({ available, rotation, height = 0.78 }) {
  return <group position={[0, height, 0]} rotation={[0, rotation, 0]}>
    <AssetBoundary fallback={<EyeFallback />}><Suspense fallback={<EyeFallback />}><EyeModel available={available} /></Suspense></AssetBoundary>
  </group>
}
