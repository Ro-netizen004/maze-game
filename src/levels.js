import { canOpenDoor as canOpenRuntimeDoor, createSeededLevel } from './levelRuntime.js'
import { addRuneClearings } from './runeClearings.js'

export const cellSize = 2
const layouts = [
  { name: 'Stonegate', color: '#526777', rows: ['#.#######', '#...#...#', '###.#.#.#', '#.....#.#', '#.#####.#', '#...#...#', '###.#.###', '#.......#', '#######.#'] },
  { name: 'Amber Halls', color: '#aa753c', rows: ['#.#########', '#...#.....#', '###.#.###.#', '#...#.#...#', '#.###.#.###', '#.....#...#', '#.#######.#', '#...#.....#', '###.#.###.#', '#.....#...#', '#########.#'] },
  { name: 'Twilight Labyrinth', color: '#75618e', rows: ['#.###########', '#...#.......#', '###.#.#####.#', '#...#...#...#', '#.#####.#.###', '#.......#...#', '#.#########.#', '#...#.......#', '###.#.#####.#', '#...#.#.....#', '#.###.#.###.#', '#.....#...#.#', '###########.#'] },
]
const runtimeConfig = {
  Stonegate: {
    keySpawnPools: { ruby: [[1, 2], [1, 3]], sapphire: [[5, 1], [5, 2], [5, 3]] },
    hidingSpots: [{ id: 'stone-alcove-1', type: 'alcove', cell: [3, 1] }, { id: 'stone-alcove-2', type: 'alcove', cell: [7, 3] }],
    traps: [{ id: 'stone-plate-1', type: 'pressure', cell: [3, 2] }, { id: 'stone-plate-2', type: 'pressure', cell: [7, 4] }],
    mechanics: { requiredDoors: ['ruby', 'sapphire'], sprintDrain: 30, staminaRegen: 20, trapSlowSeconds: 1.5 },
  },
  'Amber Halls': {
    keySpawnPools: { ruby: [[1, 2], [1, 3]], sapphire: [[5, 2], [5, 3], [5, 4]] },
    hidingSpots: [{ id: 'amber-crate-1', type: 'crate', cell: [3, 1] }, { id: 'amber-crate-2', type: 'crate', cell: [7, 5] }],
    noisyZones: [{ id: 'amber-noise-1', cell: [5, 4], intensity: 5 }, { id: 'amber-noise-2', cell: [7, 7], intensity: 5 }],
    shortcut: { id: 'amber-shortcut', name: 'Shortcut', color: '#dca85c', kind: 'shortcut', cell: [6, 5], axis: 'z', requiresKeys: ['ruby'] },
    mechanics: { requiredDoors: ['ruby', 'sapphire'], sprintDrain: 34, staminaRegen: 18, noisyFloorMultiplier: 2 },
  },
  'Twilight Labyrinth': {
    keySpawnPools: { ruby: [[1, 2], [1, 3]], sapphire: [[5, 4], [5, 5], [5, 6]] },
    hidingSpots: [{ id: 'twilight-shadow-1', type: 'shadow', cell: [3, 5] }, { id: 'twilight-shadow-2', type: 'shadow', cell: [9, 5] }],
    shrines: [{ id: 'dawn', cell: [3, 7], color: '#b9a5ff' }, { id: 'moon', cell: [7, 7], color: '#78aaff' }],
    shortcut: { id: 'twilight-shortcut', name: 'Shrine shortcut', color: '#a58cff', kind: 'shortcut', cell: [6, 7], axis: 'z', requiresShrines: ['dawn', 'moon'] },
    mechanics: { requiredDoors: ['ruby', 'sapphire'], sprintDrain: 28, staminaRegen: 22, shrineVisibilityBoost: 5 },
  },
}
// # = wall, . = passage; coordinates use [row, column].
export const levelTemplates = layouts.map(({ rows, ...level }) => {
  const config = runtimeConfig[level.name]
  return addRuneClearings({
  ...level,
  id: level.name.toLowerCase().replaceAll(' ', '-'),
  theme: { Stonegate: 'stone', 'Amber Halls': 'timber', 'Twilight Labyrinth': 'temple' }[level.name],
  start: [0, 1],
  monster: { Stonegate: [[5, 1], [3, 5]], 'Amber Halls': [[5, 1], [3, 1]], 'Twilight Labyrinth': [[5, 1], [5, 5]] }[level.name],
  keys: [
    { id: 'ruby', keyId: 'ruby', name: 'Ruby', color: '#ff5b68', cell: [1, 3] },
    { id: 'sapphire', keyId: 'sapphire', name: 'Sapphire', color: '#4dbbff', cell: { Stonegate: [5, 1], 'Amber Halls': [5, 3], 'Twilight Labyrinth': [5, 5] }[level.name] },
  ],
  doors: [
    { id: 'ruby', keyId: 'ruby', name: 'Ruby', color: '#ff5b68', cell: [2, 3], axis: 'z' },
    { id: 'sapphire', keyId: 'sapphire', name: 'Sapphire', color: '#4dbbff', cell: { Stonegate: [7, 6], 'Amber Halls': [8, 9], 'Twilight Labyrinth': [8, 11] }[level.name], axis: level.name === 'Stonegate' ? 'x' : 'z' },
    { id: 'exit', name: 'Exit', color: '#ffd75b', cell: [rows.length - 1, rows[0].length - 2], axis: 'z', offset: -0.7 },
    ...(config.shortcut ? [config.shortcut] : []),
  ],
  end: [rows.length - 1, rows[0].length - 2],
  grid: rows.map(row => [...row].map(cell => cell === '#' ? 1 : 0)),
  keySpawnPools: config.keySpawnPools,
  hidingSpots: config.hidingSpots,
  traps: config.traps || [],
  shrines: config.shrines || [],
  noisyZones: config.noisyZones || [],
  mechanics: config.mechanics,
})})
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
export function canOpenDoor(level, door, collectedKeys, openedDoors, activatedShrines = []) {
  return canOpenRuntimeDoor(level, door, collectedKeys, openedDoors, activatedShrines)
}
