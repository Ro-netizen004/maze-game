import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { levels } from './levels.js'
import { findPath } from './navigation.js'

test('eye asset fits above its pedestal and within a maze trail', () => {
  const bytes = fs.readFileSync(new URL('../public/models/watcher-eye/watcher-eye.glb', import.meta.url))
  const length = bytes.readUInt32LE(12)
  const gltf = JSON.parse(bytes.subarray(20, 20 + length).toString())
  assert.ok(bytes.length < 500_000)
  for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
    const bounds = gltf.accessors[primitive.attributes.POSITION]
    assert.ok(bounds.min[1] + 0.78 > 0.5, 'eye must clear pedestal top')
    for (let axis = 0; axis < 3; axis++) {
      assert.ok(bounds.max[axis] - bounds.min[axis] <= 0.481)
      assert.ok(Math.abs(bounds.min[axis] + bounds.max[axis]) < 0.002)
    }
  }
})

test('the Watcher eye faces the last approach cell on its reachable trail', () => {
  for (const level of levels) {
    const eye = level.offerings.find(item => item.id === 'watcher-eye')
    const path = findPath(level, level.start, eye.cell, eye.requiresDoors)
    assert.ok(path.length > 1)
    const approach = path[path.length - 2]
    assert.equal(eye.rotation, Math.atan2(approach[1] - eye.cell[1], approach[0] - eye.cell[0]))
  }
})
