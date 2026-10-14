import test from 'node:test'
import assert from 'node:assert/strict'
import { movePlayer, playerRadius } from './collision.js'
import { cellSize, cellPosition, doorBounds, doorPosition, canOpenDoor, levels } from './mazeFixtures.js'

function assertClear(level, x, z) {
  const width = level.grid[0].length * cellSize
  const depth = level.grid.length * cellSize
  assert.ok(Math.abs(x) <= width / 2 - playerRadius + 1e-6)
  assert.ok(Math.abs(z) <= depth / 2 - playerRadius + 1e-6)
  level.grid.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell) return
    const left = c * cellSize - width / 2
    const front = r * cellSize - depth / 2
    const nx = Math.max(left, Math.min(x, left + cellSize))
    const nz = Math.max(front, Math.min(z, front + cellSize))
    assert.ok(Math.hypot(x - nx, z - nz) >= playerRadius - 1e-6, 'Player overlaps a wall')
  }))
}

test('diagonal movement slides along a wall', () => {
  const level = { grid: [[0, 1], [0, 1], [0, 1]] }
  const [x, z] = movePlayer(level, -playerRadius, 0, 0.02, 0.02)
  assert.ok(x <= -playerRadius)
  assert.ok(z > 0.019)
  assertClear(level, x, z)
})

test('movement slides around the exposed corner', () => {
  const level = { grid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] }
  const startX = 1 + playerRadius / Math.sqrt(2)
  const startZ = 1 + playerRadius / Math.sqrt(2)
  const [x, z] = movePlayer(level, startX, startZ, -0.025, 0)
  assert.ok(x < startX)
  assert.ok(z > startZ)
  assertClear(level, x, z)
})

function reachable(level, opened) {
  const queue = [level.start]
  const visited = new Set()
  const locked = new Set(level.doors.filter(door => !opened.includes(door.id)).map(door => door.cell.join(',')))
  while (queue.length) {
    const [r, c] = queue.shift()
    const id = `${r},${c}`
    if (visited.has(id) || level.grid[r]?.[c] !== 0 || locked.has(id)) continue
    visited.add(id)
    queue.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1])
  }
  return visited
}

test('keys and doors enforce a solvable sequence on every map', () => {
  for (const level of levels) {
    const [ruby, sapphire] = level.keys
    assert.ok(reachable(level, []).has(ruby.cell.join(',')))
    assert.ok(!reachable(level, []).has(sapphire.cell.join(',')), `${level.name}: Sapphire must be behind Ruby`)
    assert.ok(reachable(level, ['ruby']).has(sapphire.cell.join(',')))
    assert.ok(!reachable(level, ['ruby', 'sapphire']).has(level.end.join(',')))
    assert.ok(reachable(level, ['ruby', 'sapphire', 'exit']).has(level.end.join(',')))
    const exit = level.doors.find(door => door.id === 'exit')
    assert.equal(canOpenDoor(level, exit, ['ruby', 'sapphire'], ['ruby']), false)
    assert.equal(canOpenDoor(level, exit, [], ['sapphire']), false)
    assert.equal(canOpenDoor(level, exit, [], level.mechanics.requiredDoors, [], level.mechanics.requiredClues || []), true)
    assert.equal(canOpenDoor(level, level.doors[0], ['sapphire'], []), false)
    assert.equal(canOpenDoor(level, level.doors[0], ['ruby'], []), true)
  }
})

test('locked doors block movement and opened doors allow passage', () => {
  for (const level of levels) {
    for (const door of level.doors) {
      const [x, z] = doorPosition(level, door)
      const bounds = doorBounds(level, door)
      let closed = door.axis === 'x' ? [x - 0.8, z] : [x, z - 0.8]
      let open = [...closed]
      const dx = door.axis === 'x' ? 1 / 30 : 0
      const dz = door.axis === 'z' ? 1 / 30 : 0
      for (let step = 0; step < 40; step++) {
        closed = movePlayer(level, ...closed, dx, dz, [])
        open = movePlayer(level, ...open, dx, dz, level.doors.map(item => item.id))
      }
      assert.ok(door.axis === 'x' ? closed[0] <= bounds.left - playerRadius + 1e-6 : closed[1] <= bounds.front - playerRadius + 1e-6)
      assert.ok(door.axis === 'x' ? open[0] > bounds.right : open[1] > bounds.back)
    }
  }
})

test('repeated small steps stay outside every map wall', () => {
  for (const level of levels) {
    for (let r = 0; r < level.grid.length; r++) {
      for (let c = 0; c < level.grid[r].length; c++) {
        if (level.grid[r][c]) continue
        for (let direction = 0; direction < 16; direction++) {
          let [x, z] = cellPosition(level, [r, c])
          const angle = direction * Math.PI / 8
          for (let step = 0; step < 80; step++) {
            [x, z] = movePlayer(level, x, z, Math.cos(angle) / 30, Math.sin(angle) / 30)
            assertClear(level, x, z)
          }
        }
      }
    }
  }
})

test('forest shoulders allow wider movement but cannot bypass gates or wall rows', () => {
  const level = { grid: [[1, 1, 1], [1, 0, 1], [1, 0, 1]], doors: [] }
  let position = [0, 0]
  for (let step = 0; step < 100; step++) position = movePlayer(level, ...position, 0.02, 0, [], playerRadius, 0.18)
  assert.ok(position[0] > 0.8 && position[0] < 0.9, 'shoulder expands the passage')
  for (const map of levels) {
    for (const door of map.doors) {
      const [x, z] = doorPosition(map, door)
      for (const side of [-1, 1]) {
        let p = door.axis === 'x' ? [x - 0.8, z + side * 0.95] : [x + side * 0.95, z - 0.8]
        for (let step = 0; step < 80; step++) p = movePlayer(map, ...p, door.axis === 'x' ? 0.025 : 0, door.axis === 'z' ? 0.025 : 0, [], playerRadius, 0.18)
        assert.ok(door.axis === 'x' ? p[0] < x : p[1] < z, `${map.name}: no shoulder bypass of ${door.id}`)
      }
    }
  }
})
