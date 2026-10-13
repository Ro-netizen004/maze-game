import test from 'node:test'
import assert from 'node:assert/strict'
import { Box3, Vector3 } from 'three'
import { createDeepSeaCreature } from './deepSeaCreature.js'

test('creature stays within maze clearance throughout its crawling animation', () => {
  const creature = createDeepSeaCreature()
  for (let frame = 0; frame < 180; frame++) {
    creature.update(1 / 60, true, frame > 60)
    creature.group.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(creature.group)
    const size = bounds.getSize(new Vector3())
    assert.ok(size.y > 2 && bounds.max.y < 3)
    assert.ok(Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x)) < 0.75)
    assert.ok(Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z)) < 0.75)
  }
  creature.dispose()
})

test('legs and teeth share geometry and materials', () => {
  const creature = createDeepSeaCreature()
  const geometries = new Set()
  const materials = new Set()
  let meshes = 0
  creature.group.traverse(object => {
    if (!object.isMesh) return
    meshes++
    geometries.add(object.geometry)
    materials.add(object.material)
  })
  assert.ok(meshes < 95)
  assert.equal(geometries.size, 5)
  assert.equal(materials.size, 5)
  creature.dispose()
})

test('idle posture and walking legs visibly animate', () => {
  const creature = createDeepSeaCreature()
  const pose = () => {
    creature.group.updateMatrixWorld(true)
    const values = []
    creature.group.traverse(object => { if (object.isMesh) values.push(...object.matrixWorld.elements) })
    return values
  }
  const before = pose()
  for (let i = 0; i < 30; i++) creature.update(1 / 60, false, false)
  assert.notDeepEqual(pose(), before, 'idle pose must keep breathing and swaying')
  const idle = pose()
  for (let i = 0; i < 30; i++) creature.update(1 / 60, true, true)
  assert.notDeepEqual(pose(), idle, 'walking must animate the leg joints')
  creature.dispose()
})
