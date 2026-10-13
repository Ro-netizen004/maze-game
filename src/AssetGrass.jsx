import { useLayoutEffect, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Box3, Group, InstancedMesh, Object3D, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function AssetGrass({ items, reducedMotion }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/grass/grass.glb`)
  const container = useRef(null), shaders = useRef([])
  useLayoutEffect(() => {
    const parent = container.current, group = new Group(), transform = new Object3D()
    gltf.scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(gltf.scene), center = box.getCenter(new Vector3())
    const height = box.max.y - box.min.y
    const owned = []
    gltf.scene.traverse(object => {
      if (!object.isMesh) return
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
      geometry.translate(-center.x, -box.min.y, -center.z)
      geometry.scale(1 / height, 1 / height, 1 / height)
      const material = object.material.clone()
      material.transparent = false
      material.alphaTest = 0.35
      material.depthWrite = true
      material.roughness = 0.9
      material.onBeforeCompile = shader => {
        shader.uniforms.grassTime = { value: 0 }
        shader.vertexShader = `uniform float grassTime;\n${shader.vertexShader}`.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          float tip = max(0.0, position.y);
          float wind = sin(grassTime * 1.1 + instanceMatrix[3].x * 0.8 + instanceMatrix[3].z * 0.6);
          transformed.x += wind * tip * tip * 0.12;
        `)
        shaders.current.push(shader)
      }
      const mesh = new InstancedMesh(geometry, material, items.length)
      mesh.receiveShadow = true
      mesh.castShadow = false
      items.forEach((item, index) => {
        transform.position.set(item.position[0], 0.005, item.position[2])
        transform.rotation.set(0, item.rotation[1], 0)
        transform.scale.set(item.scale[0] * 0.32, item.scale[1], 0.32)
        transform.updateMatrix()
        mesh.setMatrixAt(index, transform.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
      group.add(mesh)
      owned.push({ geometry, material, mesh })
    })
    parent.add(group)
    return () => {
      parent.remove(group)
      shaders.current = []
      owned.forEach(({ geometry, material, mesh }) => { mesh.dispose(); geometry.dispose(); material.dispose() })
    }
  }, [gltf.scene, items])
  useFrame(({ clock }) => {
    shaders.current.forEach(shader => { shader.uniforms.grassTime.value = reducedMotion ? 0 : clock.elapsedTime })
  })
  return <group ref={container} />
}
