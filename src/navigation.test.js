import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from './mazeFixtures.js'
import { findPath, worldCell } from './navigation.js'
import { movePlayer } from './collision.js'

test('monster patrol routes follow connected passages in each map', () => {
  for (const level of levels) {
    const path = findPath(level, level.monster[0], level.monster[1], [])
    assert.ok(path.length > 1, `${level.name}: patrol must be reachable`)
    let [x, z] = cellPosition(level, path[0])
    for (let i = 1; i < path.length; i++) {
      const [tx, tz] = cellPosition(level, path[i])
      assert.equal(Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1]), 1)
      for (let step = 0; step < 100 && Math.hypot(tx - x, tz - z) > 0.04; step++) {
        const distance = Math.hypot(tx - x, tz - z)
        const travel = Math.min(distance, 0.04)
        ;[x, z] = movePlayer(level, x, z, (tx - x) / distance * travel, (tz - z) / distance * travel, [], 0.75)
      }
      assert.ok(Math.hypot(tx - x, tz - z) < 0.05, `${level.name}: monster stuck at a corner`)
    }
    assert.deepEqual(worldCell(level, x, z), level.monster[1])
  }
})

test('monster cannot route through a locked door', () => {
  for (const level of levels) {
    assert.deepEqual(findPath(level, level.monster[0], level.start, []), [])
    assert.ok(findPath(level, level.monster[0], level.start, ['ruby']).length > 0)
    assert.deepEqual(findPath(level, level.monster[0], level.end, ['ruby', 'sapphire']), [])
    assert.ok(findPath(level, level.monster[0], level.end, ['ruby', 'sapphire', 'exit']).length > 0)
  }
})
