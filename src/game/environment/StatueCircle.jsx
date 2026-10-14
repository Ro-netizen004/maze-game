import { Suspense, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from '../rendering/AssetBoundary.jsx'

function HoodedStatues() {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/hooded-statue/statue.glb`)
  const statues = useMemo(() => {
    const bounds = new Box3().setFromObject(gltf.scene)
    const center = bounds.getCenter(new Vector3())
    const scale = 2.4 / bounds.getSize(new Vector3()).y
    return Array.from({ length: 8 }, (_, index) => {
      // Offset the ring so its north/south entrances remain between statues.
      const angle = index * Math.PI / 4 + Math.PI / 8
      const x = Math.sin(angle) * 4.8, z = Math.cos(angle) * 4.8
      const model = gltf.scene.clone(true)
      model.scale.setScalar(scale)
      model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
      model.traverse(node => {
        if (node.isMesh) { node.castShadow = false; node.receiveShadow = true }
      })
      return { model, position: [x, 0.02, z], rotation: [0, angle + Math.PI, 0] }
    })
  }, [gltf.scene])
  // Clones share the downloaded model's geometry, texture, and material.
  return statues.map((statue, index) => <group key={index} position={statue.position} rotation={statue.rotation}>
    <primitive object={statue.model} dispose={null} />
  </group>)
}

export default function StatueCircle() {
  return <AssetBoundary fallback={null}>
    <Suspense fallback={null}><HoodedStatues /></Suspense>
  </AssetBoundary>
}
