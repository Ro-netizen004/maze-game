import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from '../src/game/world/levels.js'
import { reachableCells } from '../src/game/world/levelRuntime.js'
import { findPath, worldCell } from '../src/game/world/navigation.js'
import { movePlayer } from '../src/game/world/collision.js'
import sourceLayout from '../src/game/world/longleatLayout.json' with { type: 'json' }
const level = levels[0]

test('active map uses the supplied Longleat geometry and exactly three middle clearings', () => {
  assert.equal(level.longleatMaze, true)
  assert.deepEqual(level.grid, sourceLayout.grid)
  assert.equal(level.cellSize, 0.5)
  assert.equal(level.clearings.length, 3)
  assert.equal(level.rituals.length, 3)
  for (let i=1;i<level.clearings.length;i++) {
    assert.ok(Math.hypot(...level.clearings[i].position.map((value,axis)=>value-level.clearings[i-1].position[axis])) >= 24)
  }
  const reachable = reachableCells(level)
  for (const clearing of level.clearings) {
    assert.ok(reachable.has(clearing.cell.join(',')))
    assert.equal(clearing.position[0], 0)
    for (let r=0;r<level.grid.length;r++) for (let c=0;c<level.grid[r].length;c++) {
      const [x,z]=cellPosition(level,[r,c])
      if (Math.hypot(x-clearing.position[0],z-clearing.position[1]) < clearing.radius-0.3) assert.equal(level.grid[r][c],0)
    }
  }
  for (const cell of [level.start, level.end, ...level.monster, ...level.hidingSpots.map(x=>x.cell)]) {
    assert.deepEqual(worldCell(level,...cellPosition(level,cell)),cell)
    assert.ok(reachable.has(cell.join(',')))
  }
})

test('player and guardian clearance can follow imported corridors to each middle rune', () => {
  for (const rune of level.rituals) {
    const route = findPath(level,level.start,rune.cell,[])
    assert.ok(route.length > 1)
    let [x,z] = cellPosition(level,level.start)
    for (const cell of route.slice(1)) {
      const [tx,tz] = cellPosition(level,cell)
      for (let i=0;i<8;i++) [x,z] = movePlayer(level,x,z,(tx-x)*0.5,(tz-z)*0.5,[],0.3)
      assert.ok(Math.hypot(x-tx,z-tz)<0.09, 'waypoint must be reachable without crossing a hedge')
    }
  }
})
