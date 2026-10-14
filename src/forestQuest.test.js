import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { forestObjective } from './forestQuest.js'
import { canOpenDoor, isLevelSolvable, reachableCells } from './levelRuntime.js'

test('first forest has loops, clearings and reachable journals behind their seals', () => {
  const level = levels[0]
  assert.equal(isLevelSolvable(level), true)
  const cells = reachableCells(level, [5, 5], ['ruby'])
  let edges = 0
  for (const id of cells) {
    const [r, c] = id.split(',').map(Number)
    edges += Number(cells.has(`${r + 1},${c}`)) + Number(cells.has(`${r},${c + 1}`))
  }
  assert.ok(edges >= cells.size + 2, 'several independent loops must remain open for escape')
  assert.ok([[3, 4], [3, 5], [4, 4], [4, 5]].every(([r,c]) => level.grid[r][c] === 0), 'a two-cell-wide clearing')
  for (const [id, door] of [['dawn-note', 'emerald'], ['dusk-note', 'amber']]) {
    const clue = level.clues.find(clue => clue.id === id)
    assert.equal(cells.has(clue.cell.join(',')), false)
    assert.equal(reachableCells(level, [5, 5], ['ruby', door]).has(clue.cell.join(',')), true)
  }
})

test('exit requires all four seals and both journals, and hints advance with progress', () => {
  const level = levels[0], exit = level.doors.find(door => door.id === 'exit')
  assert.equal(canOpenDoor(level, exit, [], level.mechanics.requiredDoors), false)
  assert.equal(canOpenDoor(level, exit, [], level.mechanics.requiredDoors, [], ['dawn-note']), false)
  assert.equal(canOpenDoor(level, exit, [], level.mechanics.requiredDoors, [], ['dawn-note', 'dusk-note']), true)
  assert.equal(forestObjective().title, 'Find the Ruby key')
  assert.equal(forestObjective(['ruby'], ['ruby']).title, 'Find the Emerald key')
  assert.equal(forestObjective(['ruby', 'emerald'], ['ruby', 'emerald']).title, 'Read the Dawn journal')
  assert.equal(forestObjective(level.keys.map(key => key.id), [...level.mechanics.requiredDoors, 'exit'], level.mechanics.requiredClues).title, 'Escape the keeper’s forest')
})
