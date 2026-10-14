import test from 'node:test'
import assert from 'node:assert/strict'
import { levelTemplates } from './levels.js'
import {
  canOpenDoor, createNoise, createSeededLevel, getLockedCellIds, hasLineOfSight,
  isLevelSolvable, noiseAtDistance, reachableCells,
} from './levelRuntime.js'
import { findPath } from './navigation.js'
const originalCell=(level,cell)=>cell.map(value=>value+(level.mapOffset||0))

test('seeded levels are deterministic and choose only configured key pools', () => {
  for (const template of levelTemplates) {
    const first = createSeededLevel(template, 'same-seed')
    const second = createSeededLevel(template, 'same-seed')
    assert.deepEqual(first.keys, second.keys)
    for (const key of first.keys) {
      assert.ok(template.keySpawnPools[key.id].some(cell => cell.join(',') === key.cell.join(',')))
    }
  }
})

test('spawn variants preserve each handcrafted progression', () => {
  for (const template of levelTemplates) {
    for (let seed = 0; seed < 25; seed++) {
      assert.equal(isLevelSolvable(createSeededLevel(template, seed)), true, `${template.name} seed ${seed}`)
    }
  }
})

test('shared locked cells control reachability and shortcuts', () => {
  const amber = createSeededLevel(levelTemplates[1], 'doors')
  assert.ok(getLockedCellIds(amber, []).has(originalCell(amber,[6,5]).join(',')))
  const longRoute = findPath(amber, originalCell(amber,[5, 5]), originalCell(amber,[7, 5]), [])
  const shortcutRoute = findPath(amber, originalCell(amber,[5, 5]), originalCell(amber,[7, 5]), ['amber-shortcut'])
  assert.ok(longRoute.length > shortcutRoute.length)
  assert.equal(shortcutRoute.length, 3)
  assert.ok(reachableCells(amber, originalCell(amber,[5, 5]), ['amber-shortcut']).has(originalCell(amber,[7,5]).join(',')))
  const shortcut = amber.doors.find(door => door.id === 'amber-shortcut')
  assert.equal(canOpenDoor(amber, shortcut, [], []), false)
  assert.equal(canOpenDoor(amber, shortcut, ['ruby'], []), true)
})

test('line of sight is blocked by walls and closed doors', () => {
  const amber = createSeededLevel(levelTemplates[1], 'sight')
  assert.equal(hasLineOfSight(amber, originalCell(amber,[5, 5]), originalCell(amber,[7, 5]), []), false)
  assert.equal(hasLineOfSight(amber, originalCell(amber,[5, 5]), originalCell(amber,[7, 5]), ['amber-shortcut']), true)
  assert.equal(hasLineOfSight(amber, originalCell(amber,[1, 1]), originalCell(amber,[1, 3]), []), true)
})

test('noise groundwork has deterministic Manhattan falloff', () => {
  const noise = createNoise([4, 4], 5, 'sprint')
  assert.deepEqual(noise, { cell: [4, 4], intensity: 5, source: 'sprint' })
  assert.equal(noiseAtDistance(noise, [5, 6]), 2)
  assert.equal(noiseAtDistance(noise, [9, 9]), 0)
})
