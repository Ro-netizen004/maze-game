import { Suspense, useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from './MonsterAssetBoundary'
import ForestMaze, { GroundMist } from './ForestMaze'
import Landmarks from './Landmarks.jsx'

function ScenePack() {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/first-forest/stage.glb`)
  const container = useRef(null)
  useEffect(() => {
    const parent = container.current
    const scene = gltf.scene.clone(true), materials = []
    scene.traverse(object => {
      if (!object.isMesh) return
      const material = object.material.clone()
      const foliage = material.transparent || material.alphaTest > 0
      if (foliage) {
        material.transparent = false
        material.alphaTest = 0.5
        material.depthWrite = true
      }
      material.roughness = 0.95
      object.material = material
      object.castShadow = !foliage && !object.name.includes('Material.003')
      object.receiveShadow = true
      materials.push(material)
    })
    parent.add(scene)
    return () => { parent.remove(scene); materials.forEach(material => material.dispose()) }
  }, [gltf.scene])
  return <group ref={container} />
}

export default function FirstForest({ level, mobile, reducedMotion }) {
  return <AssetBoundary fallback={<ForestMaze level={level} mobile={mobile} reducedMotion={reducedMotion} />}>
    <Suspense fallback={null}><ScenePack /></Suspense>
    <GroundMist level={level} />
    <Landmarks level={level} forest />
  </AssetBoundary>
}
