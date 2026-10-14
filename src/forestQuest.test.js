import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { forestObjective } from './forestQuest.js'
import { canEscapeForest, journalCollection } from './journals.js'
import { reachableCells } from './levelRuntime.js'
import { findPath } from './navigation.js'

const level = levels[0]
test('open forest has exactly five complete journals reachable without gates', () => {
  assert.equal(level.clues.length, 5)
  assert.equal(level.doors.length, 0)
  assert.equal(level.keys.length, 0)
  assert.equal(new Set(level.clues.map(item => item.id)).size, 5)
  const reachable = reachableCells(level)
  assert.ok(reachable.size > 550, 'broad open forest, not narrow corridors')
  for (const journal of level.clues) {
    assert.ok(reachable.has(journal.cell.join(',')))
    assert.ok(journal.text.length > 200 && journal.hint.length > 60)
  }
  for (const from of level.clues) for (const to of level.clues) {
    assert.ok(findPath(level, from.cell, to.cell).length > 0, 'any discovery order works')
  }
  assert.ok(reachable.has(level.end.join(',')))
})
test('escape requires all five distinct journal IDs, not a collection count', () => {
  const ids = level.clues.map(item => item.id)
  assert.equal(canEscapeForest(level, []), false)
  for (const missing of ids) assert.equal(canEscapeForest(level, ids.filter(id => id !== missing)), false)
  assert.equal(canEscapeForest(level, Array(5).fill(ids[0])), false)
  const runes = level.rituals.map(item => item.id)
  assert.equal(canEscapeForest(level, [...ids].reverse(), runes), true)
  assert.equal(canEscapeForest(level, ids), false)
  assert.equal(forestObjective(ids, runes).title, 'Return to the Old Road')
  assert.equal(forestObjective([ids[0]], [runes[0]]).title, 'Find Borrowed Footsteps')
  assert.equal(forestObjective([ids[0]]).title, 'Activate The Arrival rune')
  assert.deepEqual(journalCollection(level, [], [ids[3], ids[0]]).map(item => item.id), [ids[0], ids[3]])
})
test('guardian can patrol all forest sites with no gate restrictions', () => {
  for (let i = 0; i < level.monster.length; i++) {
    assert.ok(findPath(level, level.monster[i], level.monster[(i + 1) % level.monster.length]).length > 1)
    assert.ok(findPath(level, level.monster[i], level.start).length > 0)
  }
})
