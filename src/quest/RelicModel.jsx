import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { prepareRelicModel, updateCandleFlames } from './relicMaterials.js'
import AssetBoundary from '../MonsterAssetBoundary.jsx'

function Model({ name, active, reducedMotion, liquidColor }) {
  const flameRef = useRef([])
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${name}/${name}.glb`)
  const { model, materials, flames } = useMemo(() => prepareRelicModel(gltf.scene, name, liquidColor), [gltf.scene, name, liquidColor])
  useEffect(() => { flameRef.current = flames }, [flames])
  useFrame(({ clock }) => {
    if (!active || reducedMotion) return
    updateCandleFlames(flameRef.current, clock.elapsedTime)
  })
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  return <primitive object={model} dispose={null} />
}

function Fallback({ name }) {
  if (name === 'golden-eye') return <mesh position={[0,0.2,0]} scale={[1,0.65,0.3]}><octahedronGeometry args={[0.28,0]} /><meshStandardMaterial color="#d6a73c" metalness={0.65} roughness={0.4} /></mesh>
  if (name === 'watcher-eye') return <mesh><sphereGeometry args={[0.24,16,12]} /><meshStandardMaterial color="#dbd4c5" roughness={0.35} /></mesh>
  return <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.09,0.1,0.4,10]} /><meshStandardMaterial color="#e0ca94" /></mesh>
}

export default function RelicModel({ name, active = false, reducedMotion = false, liquidColor }) {
  return <AssetBoundary fallback={<Fallback name={name} />}><Suspense fallback={<Fallback name={name} />}><Model name={name} liquidColor={liquidColor} active={active} reducedMotion={reducedMotion} /></Suspense></AssetBoundary>
}
