import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from '../src/game/world/levels.js'
import { nearbyRitual, RITUAL_INTERACTION_DISTANCE } from '../src/game/quest/rituals.js'
import { canEscapeForest } from '../src/game/quest/journals.js'
import { readFile } from 'node:fs/promises'

const level = levels[0]
test('five rituals can be activated from every side without exact aiming', () => {
  assert.equal(level.rituals.length, 5)
  for (const ritual of level.rituals) {
    const [x, z] = cellPosition(level, ritual.cell)
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4, distance = RITUAL_INTERACTION_DISTANCE - 0.1
      assert.equal(nearbyRitual(level, x + Math.cos(angle) * distance, z + Math.sin(angle) * distance)?.id, ritual.id)
    }
    assert.equal(nearbyRitual(level, x, z, level.rituals.map(item => item.id)), null)
    const bounds = level.movementBounds
    assert.ok(x - 1.6 >= bounds.left && x + 1.6 <= bounds.right && z - 1.6 >= bounds.front && z + 1.6 <= bounds.back)
  }
})
test('all records and all ritual activations are required for escape', () => {
  const journals = level.clues.map(item => item.id), rituals = level.rituals.map(item => item.id)
  assert.equal(canEscapeForest(level, journals, rituals), true)
  assert.equal(canEscapeForest(level, [], rituals), false)
  for (const missing of rituals) assert.equal(canEscapeForest(level, journals, rituals.filter(id => id !== missing)), false)
})

test('ritual browser asset stays inside the shared geometry and download budget', async () => {
  const bytes = await readFile(new URL('../public/models/ritual-circle/ritual-circle.glb', import.meta.url))
  assert.ok(bytes.length < 6 * 1024 * 1024, 'original 61 MB asset must not be loaded by the game')
  const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)))
  const triangles = gltf.meshes.flatMap(mesh => mesh.primitives).reduce((sum, part) => sum + gltf.accessors[part.indices].count / 3, 0)
  assert.ok(triangles <= 12000)
  assert.equal(gltf.materials.length, 1)
})
