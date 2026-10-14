import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from './MonsterAssetBoundary.jsx'

function Model({ name, active, reducedMotion }) {
  const flameRef = useRef([])
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/${name}/${name}.glb`)
  const { model, materials, flames } = useMemo(() => {
    const model = gltf.scene.clone(true), materials = [], flames = []
    model.traverse(node => {
      if (!node.isMesh) return
      const clones = (Array.isArray(node.material) ? node.material : [node.material]).map(material => {
        const clone = material.clone()
        if (name === 'ritual-candle' && /flame/i.test(node.name)) {
          clone.emissive.set('#ffae45')
          clone.emissiveIntensity = 1.5
          flames.push(clone)
        } else if (name !== 'ritual-candle') {
          clone.emissive.copy(clone.color)
          clone.emissiveMap = clone.map
          clone.emissiveIntensity = 0.25
        }
        materials.push(clone)
        return clone
      })
      node.material = Array.isArray(node.material) ? clones : clones[0]
    })
    return { model, materials, flames }
  }, [gltf.scene, name])
  useEffect(() => { flameRef.current = flames }, [flames])
  useFrame(({ clock }) => {
    if (!active || reducedMotion) return
    // These are cloned Three.js GPU materials, updated imperatively by the renderer.
    // eslint-disable-next-line react-hooks/immutability
    for (const flame of flameRef.current) flame.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime*11)*0.18 + Math.sin(clock.elapsedTime*17)*0.1
  })
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials])
  return <primitive object={model} dispose={null} />
}

function Fallback() {
  return <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.09,0.1,0.4,10]} /><meshStandardMaterial color="#e0ca94" /></mesh>
}

export default function RelicModel({ name, active = false, reducedMotion = false }) {
  return <AssetBoundary fallback={<Fallback />}><Suspense fallback={<Fallback />}><Model name={name} active={active} reducedMotion={reducedMotion} /></Suspense></AssetBoundary>
}
