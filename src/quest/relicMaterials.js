// Clone only materials: geometry and textures stay shared by cached GLTF instances.
export function prepareRelicModel(scene, name) {
  const model = scene.clone(true)
  const materials = [], flames = []
  model.traverse(node => {
    if (!node.isMesh) return
    const source = Array.isArray(node.material) ? node.material : [node.material]
    const clones = source.map(material => {
      const clone = material.clone()
      if (name === 'ritual-candle' && /flame/i.test(node.name)) {
        clone.emissive.set('#ffae45')
        clone.emissiveIntensity = 1.5
        flames.push(clone)
      } else if (name === 'watcher-eye') {
        clone.emissiveIntensity = 0.35
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
}

export function updateCandleFlames(flames, elapsedTime) {
  const intensity = 1.5 + Math.sin(elapsedTime * 11) * 0.18 + Math.sin(elapsedTime * 17) * 0.1
  for (const material of flames) material.emissiveIntensity = intensity
}
