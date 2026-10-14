import { cellSize } from './levels.js'
import { getLockedCellIds } from './levelRuntime.js'
export function worldCell(level, x, z) {
  return [Math.floor(z / cellSize + level.grid.length / 2), Math.floor(x / cellSize + level.grid[0].length / 2)]
}
export function findPath(level, start, goal, openedDoors) {
  const locked = getLockedCellIds(level, openedDoors)
  const opened = new Set(openedDoors)
  const openDoorCells = new Set(level.doors.filter(door => opened.has(door.id)).map(door => door.cell.join(',')))
  const queue = [start]
  const parents = new Map([[start.join(','), null]])
  if (locked.has(goal.join(',')) || (level.grid[goal[0]]?.[goal[1]] !== 0 && !openDoorCells.has(goal.join(',')))) return []
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head]
    const [r, c] = cell
    if (cell.join(',') === goal.join(',')) {
      const path = []
      let current = cell
      while (current) { path.unshift(current); current = parents.get(current.join(',')) }
      return path
    }
    for (const next of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
      const id = next.join(',')
      if ((level.grid[next[0]]?.[next[1]] !== 0 && !openDoorCells.has(id)) || locked.has(id) || parents.has(id)) continue
      parents.set(id, cell)
      queue.push(next)
    }
  }
  return []
}
