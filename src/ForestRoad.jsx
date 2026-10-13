import { useEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { Box3, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function ForestRoad({ position }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/forest-road/forest-road.glb`)
  const container = useRef(null)
  useEffect(() => {
    const parent = container.current, scene = gltf.scene.clone(true), oriented = new Group()
    oriented.add(scene)
    let bounds = new Box3().setFromObject(oriented)
    const size = bounds.getSize(new Vector3())
    if (size.x > size.z) oriented.rotation.y = Math.PI / 2
    bounds = new Box3().setFromObject(oriented)
    const scale = 30 / bounds.getSize(new Vector3()).z
    const center = bounds.getCenter(new Vector3())
    oriented.scale.setScalar(scale)
    oriented.position.set(-center.x * scale, -bounds.min.y * scale - 0.04, -bounds.min.z * scale)
    const materials = []
    scene.traverse(object => {
      if (!object.isMesh) return
      object.material = object.material.clone()
      const foliage = object.material.transparent
      if (foliage) { object.material.transparent = false; object.material.alphaTest = 0.5; object.material.depthWrite = true }
      object.castShadow = !foliage
      object.receiveShadow = true
      materials.push(object.material)
    })
    parent.add(oriented)
    return () => { parent.remove(oriented); materials.forEach(material => material.dispose()) }
  }, [gltf.scene])
  return <group position={position} ref={container} />
}
