import { canOpenDoor as canOpenRuntimeDoor, createSeededLevel } from './levelRuntime.js'
import { forestJournals } from '../quest/journals.js'
import layout from './longleatLayout.json' with { type: 'json' }
export const cellSize = 2 // Legacy map units; imported levels declare their own units.
const order = [2, 3, 4, 0, 1]
const clues = forestJournals.map((journal, index) => ({ ...journal, cell: layout.journalCells[order[index]] }))
const colors = ['#74d4ca', '#b8a0ef', '#e9b85b']
const rituals = layout.clearings.map((clearing, index) => ({ ...clearing, color: colors[index] }))
export const levelTemplates = [{
  id: 'keepers-longleat', name: 'The Keeper’s Maze', theme: 'stone', openForest: true, treeLabyrinth: true, longleatMaze: true,
  cellSize: layout.cellSize, movementBounds: layout.bounds, clearings: layout.clearings,
  grid: layout.grid, start: layout.start, end: layout.end,
  monster: [layout.clearings[1].cell, layout.clearings[0].cell, layout.clearings[2].cell, clues[2].cell],
  keys: [], doors: [], clues, rituals, keySpawnPools: {},
  hidingSpots: [{ id: 'north-shelter', type: 'alcove', cell: [layout.clearings[0].cell[0], layout.clearings[0].cell[1] + 5] }, { id: 'south-shelter', type: 'alcove', cell: [layout.clearings[2].cell[0], layout.clearings[2].cell[1] - 5] }],
  traps: [], shrines: [], noisyZones: [],
  mechanics: { requiredDoors: [], requiredClues: clues.map(item => item.id), requiredRituals: rituals.map(item => item.id), sprintDrain: 30, staminaRegen: 12 },
  landmarks: [...clues.map((journal,index) => ({ name: ['CROWN CAMP','OWL WATCH','MOON HOLLOW','FALLEN ARCH','LAST WATCH'][index], cell: journal.cell, symbol: ['sun','eye','moon','star','diamond'][index], color: journal.color })),
    { name:'OLD ROAD', cell: layout.end, symbol:'mountain', color:'#7db6eb' }],
}]
export const levels = levelTemplates.map(level => createSeededLevel(level, level.id))
export function cellPosition(level, [row, column]) {
  return [(column - (level.grid[0].length - 1) / 2) * (level.cellSize || cellSize), (row - (level.grid.length - 1) / 2) * (level.cellSize || cellSize)]
}

export function doorPosition(level, door) {
  const [x, z] = cellPosition(level, door.cell)
  return door.axis === 'x' ? [x + (door.offset || 0), z] : [x, z + (door.offset || 0)]
}
export function doorBounds(level, door = level.doors.find(item => item.id === 'exit')) {
  const [x, z] = doorPosition(level, door)
  return door.axis === 'x'
    ? { left: x - 0.15, right: x + 0.15, front: z - 1, back: z + 1 }
    : { left: x - 1, right: x + 1, front: z - 0.15, back: z + 0.15 }
}
export function canOpenDoor(level, door, collectedKeys, openedDoors, activatedShrines = [], collectedClues = []) {
  return canOpenRuntimeDoor(level, door, collectedKeys, openedDoors, activatedShrines, collectedClues)
}
