import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from '../src/game/world/levels.js'
import { moveWithinBoundary, playerRadius } from '../src/game/world/collision.js'

const level = levels[0]
test('boundary-only helper can still cross interior scenery cells in free-roaming mode', () => {
  for (let r = 1; r < level.grid.length - 1; r++) for (let c = 1; c < level.grid[r].length - 1; c++) {
    if (!level.grid[r][c]) continue
    const [x, z] = cellPosition(level, [r, c])
    const horizontal = moveWithinBoundary(level, x - 0.8, z, 1.6, 0)
    const vertical = moveWithinBoundary(level, x, z - 0.8, 0, 1.6)
    assert.ok(Math.abs(horizontal[0] - (x + 0.8)) < 1e-9 && horizontal[1] === z)
    assert.ok(vertical[0] === x && Math.abs(vertical[1] - (z + 0.8)) < 1e-9)
  }
})
test('running, jumping or a long movement step cannot leave any boundary edge', () => {
  const { left, right, front, back } = level.movementBounds
  assert.deepEqual(moveWithinBoundary(level, 0, 0, 1000, 1000), [right - playerRadius, back - playerRadius])
  assert.deepEqual(moveWithinBoundary(level, 0, 0, -1000, -1000), [left + playerRadius, front + playerRadius])
  assert.deepEqual(moveWithinBoundary(level, right - playerRadius, 0, 1, 2), [right - playerRadius, 2], 'movement slides along the edge')
  assert.deepEqual(moveWithinBoundary(level, 0, front + playerRadius, 2, -1), [2, front + playerRadius])
})
test('every journal and escape location is inside the free movement boundary', () => {
  for (const cell of [level.start, level.end, ...level.clues.map(item => item.cell)]) {
    const [x, z] = cellPosition(level, cell)
    assert.deepEqual(moveWithinBoundary(level, x, z, 0, 0), [x, z])
  }
})
