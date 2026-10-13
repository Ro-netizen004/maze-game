import { useLayoutEffect, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { Group, InstancedMesh, Object3D } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { prepareTreeVariants } from './treeVariants'

export default function RealisticTrees({ trees, bushes }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/forest-trees/trees.glb`)
  const container = useRef(null)
  useLayoutEffect(() => {
    const parent = container.current, group = new Group(), asset = prepareTreeVariants(gltf.scene)
    const species = asset.variants.filter(variant => !variant.bush), bush = asset.variants.find(variant => variant.bush)
    const batches = species.map((variant, index) => ({ variant, items: trees.filter((_, i) => i % species.length === index), bush: false }))
    if (bush) batches.push({ variant: bush, items: bushes, bush: true })
    const transform = new Object3D()
    batches.forEach(({ variant, items, bush }) => {
      if (!items.length) return
      variant.parts.forEach(part => {
        const mesh = new InstancedMesh(part.geometry, part.material, items.length)
        mesh.castShadow = !part.leaves && !bush
        mesh.receiveShadow = true
        items.forEach((item, index) => {
          const height = bush ? item.scale[1] * 1.4 : item.scale[1]
          transform.position.set(item.position[0], 0, item.position[2])
          transform.rotation.set(0, (index * 2.399 + item.position[0]) % (Math.PI * 2), 0)
          transform.scale.set(bush ? 0.7 : height * 0.5, height, bush ? 0.7 : height * 0.5)
          transform.updateMatrix()
          mesh.setMatrixAt(index, transform.matrix)
        })
        mesh.instanceMatrix.needsUpdate = true
        mesh.computeBoundingSphere()
        group.add(mesh)
      })
    })
    parent.add(group)
    return () => { parent.remove(group); group.traverse(object => { if (object.isInstancedMesh) object.dispose() }); asset.dispose() }
  }, [gltf.scene, trees, bushes])
  return <group ref={container} />
}
