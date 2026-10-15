import test from 'node:test'
import assert from 'node:assert/strict'
import { BoxGeometry, Mesh, MeshStandardMaterial, Scene, Texture } from 'three'
import { prepareRelicModel, updateCandleFlames } from './quest/relicMaterials.js'

test('relic instances share geometry and textures but isolate materials and flame animation', () => {
  const scene = new Scene(), geometry = new BoxGeometry(), texture = new Texture()
  const sourceMaterial = new MeshStandardMaterial({ map: texture })
  const mesh = new Mesh(geometry, [sourceMaterial, sourceMaterial])
  mesh.name = 'flame_0'
  scene.add(mesh)
  const first = prepareRelicModel(scene, 'ritual-candle')
  const second = prepareRelicModel(scene, 'ritual-candle')
  assert.equal(first.model.children[0].geometry, geometry)
  assert.equal(first.materials[0].map, texture)
  assert.notEqual(first.materials[0], sourceMaterial)
  assert.notEqual(first.materials[0], second.materials[0])
  updateCandleFlames(first.flames, 1)
  assert.notEqual(first.materials[0].emissiveIntensity, second.materials[0].emissiveIntensity)
  assert.equal(sourceMaterial.emissiveIntensity, 1)
  const eye = prepareRelicModel(scene, 'watcher-eye')
  assert.equal(eye.materials[0].emissiveIntensity, 0.35)
  for (const instance of [first, second, eye]) instance.materials.forEach(material => material.dispose())
  geometry.dispose()
  texture.dispose()
  sourceMaterial.dispose()
})
