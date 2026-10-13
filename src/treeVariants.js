import { Box3, Vector3 } from 'three'

export function prepareTreeVariants(scene) {
  scene.updateMatrixWorld(true)
  const variants = []
  scene.traverse(node => {
    if (node.isMesh || !/^Tree/.test(node.name) || !node.children.some(child => child.isMesh)) return
    const meshes = node.children.filter(child => child.isMesh)
    const box = new Box3().setFromObject(node), height = box.max.y - box.min.y
    if (height <= 0) return
    const base = box.getCenter(new Vector3())
    let count = 0, x = 0, z = 0
    meshes.filter(mesh => /branch/i.test(mesh.name)).forEach(mesh => {
      const positions = mesh.geometry.attributes.position, vertex = new Vector3()
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld)
        if (vertex.y < box.min.y + height * 0.04) { x += vertex.x; z += vertex.z; count++ }
      }
    })
    if (count) { base.x = x / count; base.z = z / count }
    base.y = box.min.y
    const parts = meshes.map(mesh => {
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
      geometry.translate(-base.x, -base.y, -base.z)
      geometry.scale(1 / height, 1 / height, 1 / height)
      geometry.computeBoundingBox()
      const material = mesh.material.clone(), leaves = /leav/i.test(mesh.name)
      if (leaves) { material.transparent = false; material.alphaTest = 0.45; material.depthWrite = true }
      material.roughness = 0.9
      return { geometry, material, leaves }
    })
    variants.push({ name: node.name, bush: /bush/i.test(node.name), parts })
  })
  return { variants, dispose() { variants.forEach(variant => variant.parts.forEach(part => { part.geometry.dispose(); part.material.dispose() })) } }
}
