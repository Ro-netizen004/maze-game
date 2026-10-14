import { useEffect, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Box3, FrontSide, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function FlashlightModel({ on }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/flashlight/flashlight.glb`)
  const container = useRef(null), materials = useRef([])
  useEffect(() => {
    const parent = container.current, model = gltf.scene.clone(true), oriented = new Group()
    oriented.add(model)
    let box = new Box3().setFromObject(oriented)
    const size = box.getSize(new Vector3())
    if (size.y >= size.x && size.y >= size.z) oriented.rotation.x = -Math.PI / 2
    else if (size.x >= size.z) oriented.rotation.y = Math.PI / 2
    box = new Box3().setFromObject(oriented)
    const center = box.getCenter(new Vector3())
    const scale = 0.38 / box.getSize(new Vector3()).z
    oriented.scale.setScalar(scale)
    oriented.position.copy(center.multiplyScalar(-scale))
    const owned = []
    model.traverse(object => {
      if (!object.isMesh) return
      object.castShadow = false
      object.receiveShadow = false
      object.material = object.material.clone()
      object.material.transparent = false
      object.material.side = FrontSide
      object.material.alphaTest = 0.05
      if (object.material.emissiveMap) object.material.emissive.set('#ffffff')
      object.material.userData.originalEmission = object.material.emissiveIntensity
      owned.push(object.material)
    })
    materials.current = owned
    parent.add(oriented)
    return () => { parent.remove(oriented); owned.forEach(material => material.dispose()); materials.current = [] }
  }, [gltf.scene])
  useFrame(() => {
    materials.current.forEach(material => { material.emissiveIntensity = on ? material.userData.originalEmission : 0 })
  })
  return <group ref={container} />
}
