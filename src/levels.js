import { canOpenDoor as canOpenRuntimeDoor, createSeededLevel } from './levelRuntime.js'
import { forestJournals } from './journals.js'
export const cellSize = 2
const grid = Array.from({ length: 25 }, () => Array(25).fill(0))
const rituals = forestJournals.map(journal => ({ id: `ritual-${journal.id}`, journalId: journal.id, name: `${journal.name} rune`, cell: [journal.cell[0] + 2, journal.cell[1]], color: journal.color }))
// Isolated tree/rock islands with open space on every side, not corridor walls.
const reserved = [[2, 3], [23, 21], [13, 13], [7, 19], [20, 16], [17, 5], [9, 19], [20, 5], ...forestJournals.map(item => item.cell), ...rituals.map(item => item.cell)]
for (let r = 2; r < 23; r += 3) {
  for (let c = 2 + r % 3; c < 23; c += 4) {
    if (!reserved.some(([rr, cc]) => Math.hypot(rr - r, cc - c) < 2.5)) grid[r][c] = 1
  }
}
export const levelTemplates = [{
  id: 'keepers-forest', name: 'The Keeper’s Forest', theme: 'stone', openForest: true,
  movementBounds: { left: -25, right: 25, front: -25, back: 25 },
  grid, start: [2, 3], end: [23, 21], monster: [[13, 13], [7, 19], [20, 16], [17, 5]],
  keys: [], doors: [], clues: forestJournals, keySpawnPools: {},
  hidingSpots: [{ id: 'hollow-shelter', type: 'alcove', cell: [9, 19] }, { id: 'arch-shelter', type: 'alcove', cell: [20, 5] }],
  traps: [], shrines: [], noisyZones: [],
  rituals,
  mechanics: { requiredDoors: [], requiredClues: forestJournals.map(item => item.id), requiredRituals: rituals.map(item => item.id), sprintDrain: 30, staminaRegen: 20 },
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
