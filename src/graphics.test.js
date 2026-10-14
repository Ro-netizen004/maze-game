import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { graphicsPreset } from './graphics.js'
import { normalizeProgress } from './persistence.js'

test('old saves receive balanced graphics; mobile always uses a small rendering budget', () => {
  const progress = normalizeProgress({ version: 1, settings: {} })
  assert.equal(progress.settings.graphicsQuality, 'balanced')
  assert.equal(normalizeProgress({ version: 1, settings: { graphicsQuality: 'unknown' } }).settings.graphicsQuality, 'balanced')
  assert.equal(graphicsPreset('high', true), graphicsPreset('performance'))
  assert.equal(graphicsPreset('performance').shadows, false)
  assert.ok(graphicsPreset('balanced').shadowSize < graphicsPreset('high').shadowSize)
})

async function model(name) {
  const bytes = await readFile(new URL('../public/models/' + name, import.meta.url))
  assert.equal(bytes.readUInt32LE(0), 0x46546c67)
  return JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
}
function primitives(gltf) { return gltf.meshes.flatMap(mesh => mesh.primitives) }
function triangles(gltf) { return primitives(gltf).reduce((total, part) => total + gltf.accessors[part.indices ?? part.attributes.POSITION].count / 3, 0) }

test('optimized vegetation keeps the required tree hierarchy with less than half the geometry', async () => {
  const original = await model('forest-trees/trees.glb'), lite = await model('forest-trees/trees-lite.glb')
  assert.ok(triangles(lite) < triangles(original) * 0.5)
  const variants = lite.nodes.filter(node => /^Tree/.test(node.name) && node.children?.some(id => lite.nodes[id].mesh !== undefined))
  assert.equal(variants.length, 4)
  assert.ok(variants.some(node => /bush/i.test(node.name)))
  assert.ok(triangles(await model('grass/grass-lite.glb')) < 3000)
})

test('journal optimization preserves the book shape and textures while merging draw calls', async () => {
  const source = await model('book-prop/book.glb'), lite = await model('book-prop/book-lite.glb')
  assert.equal(triangles(lite), triangles(source))
  assert.equal(primitives(lite).length, 3)
  assert.equal(lite.images.length, source.images.length)
})
