import { canOpenDoor as canOpenRuntimeDoor, createSeededLevel } from './levelRuntime.js'
import { forestJournals } from '../quest/journals.js'
import { createForestLayout, connectForestClearings } from './forestLayout.js'
export const cellSize = 2
const grid = createForestLayout()
const rituals = forestJournals.map(journal => ({ id: `ritual-${journal.id}`, journalId: journal.id, name: `${journal.name} rune`, cell: [journal.cell[0] + 2, journal.cell[1]], color: journal.color }))
// Keep objective clearings and shelter approaches open.
const reserved = [[2, 3], [23, 21], [13, 13], [7, 19], [20, 16], [17, 5], [9, 19], [20, 5], ...forestJournals.map(item => item.cell), ...rituals.map(item => item.cell)]
for (const [r, c] of reserved) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
  if (r + dr > 0 && r + dr < 24 && c + dc > 0 && c + dc < 24) grid[r + dr][c + dc] = 0
}
connectForestClearings(grid, [2, 3])
export const levelTemplates = [{
  id: 'keepers-forest', name: 'The Keeper’s Forest', theme: 'stone', openForest: true, treeLabyrinth: true,
  movementBounds: { left: -25, right: 25, front: -25, back: 25 },
  grid, start: [2, 3], end: [23, 21], monster: [[13, 13], [7, 19], [20, 16], [17, 5]],
  keys: [], doors: [], clues: forestJournals, keySpawnPools: {},
  hidingSpots: [{ id: 'hollow-shelter', type: 'alcove', cell: [9, 19] }, { id: 'arch-shelter', type: 'alcove', cell: [20, 5] }],
  traps: [], shrines: [], noisyZones: [],
  rituals,
  mechanics: { requiredDoors: [], requiredClues: forestJournals.map(item => item.id), requiredRituals: rituals.map(item => item.id), sprintDrain: 30, staminaRegen: 12 },
  landmarks: [
    { name: 'CROWN CAMP', cell: [3, 5], symbol: 'sun', color: '#e9b85b' },
    { name: 'OWL WATCH', cell: [7, 17], symbol: 'eye', color: '#74d4ca' },
    { name: 'MOON HOLLOW', cell: [15, 19], symbol: 'moon', color: '#b8a0ef' },
    { name: 'FALLEN ARCH', cell: [19, 7], symbol: 'star', color: '#9aca6b' },
    { name: 'LAST WATCH', cell: [12, 4], symbol: 'diamond', color: '#f18b9d' },
    { name: 'OLD ROAD', cell: [23, 21], symbol: 'mountain', color: '#7db6eb' },
  ],
}]
export const levels = levelTemplates.map(level => createSeededLevel(level, level.id))
export function cellPosition(level, [row, column]) {
  return [(column - (level.grid[0].length - 1) / 2) * cellSize, (row - (level.grid.length - 1) / 2) * cellSize]
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
