import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function BookModel() {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/book-prop/book-lite.glb`)
  const book = useMemo(() => {
    const model = gltf.scene.clone(true)
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const scale = 0.65 / Math.max(size.x, size.y, size.z)
    model.scale.multiplyScalar(scale)
    const center = box.getCenter(new Vector3())
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    model.traverse(node => { if (node.isMesh) { node.castShadow = true; node.receiveShadow = true } })
    return model
  }, [gltf.scene])
  return <primitive object={book} dispose={null} />
}
