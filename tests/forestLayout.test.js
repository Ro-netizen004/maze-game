import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from '../src/game/world/levels.js'
import { reachableCells, hasLineOfSight } from '../src/game/world/levelRuntime.js'
import { movePlayer } from '../src/game/world/collision.js'
const level = levels[0]

test('every labyrinth corridor and objective belongs to one connected forest', () => {
  assert.equal(level.treeLabyrinth, true)
  const openCells = level.grid.flat().filter(cell => !cell).length
  assert.equal(reachableCells(level).size, openCells)
  assert.ok(level.grid.flat().filter(Boolean).length > 200)
  for (const item of [...level.clues, ...level.rituals, ...level.hidingSpots]) {
    assert.equal(level.grid[item.cell[0]][item.cell[1]], 0)
  }
})

test('player and guardian cannot cross a tree barrier from an adjacent corridor', () => {
  let checked = 0
  for (let r = 1; r < 24; r++) for (let c = 1; c < 23; c++) {
    if (level.grid[r][c] || !level.grid[r][c + 1]) continue
    const [x, z] = cellPosition(level, [r, c])
    for (const radius of [0.3, 0.75]) {
      let px = x, pz = z
      for (let i = 0; i < 50; i++) [px, pz] = movePlayer(level, px, pz, 0.06, 0, [], radius)
      assert.ok(px <= x + 1 - radius + 0.001)
    }
    assert.equal(hasLineOfSight(level, [r, c], [r, c + 1], []), false)
    checked++
  }
  assert.ok(checked > 30)
})
