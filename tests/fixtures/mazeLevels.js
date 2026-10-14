import { canOpenDoor as canOpenRuntimeDoor, createSeededLevel } from '../../src/game/world/levelRuntime.js'

export const cellSize = 2
const layouts = [
  { name: 'Stonegate', color: '#526777', rows: ['#.###########', '#...#########', '###.#########', '#.....#.....#', '#.##..#..##.#', '#...........#', '#.##....#.###', '#.....#.#..##', '#.#.##..#..##', '#.#..#..#####', '#..##.....###', '#...........#', '###########.#'] },
  { name: 'Amber Halls', color: '#aa753c', rows: ['#.#########', '#...#.....#', '###.#.###.#', '#...#.#...#', '#.###.#.###', '#.....#...#', '#.#######.#', '#...#.....#', '###.#.###.#', '#.....#...#', '#########.#'] },
  { name: 'Twilight Labyrinth', color: '#75618e', rows: ['#.###########', '#...#.......#', '###.#.#####.#', '#...#...#...#', '#.#####.#.###', '#.......#...#', '#.#########.#', '#...#.......#', '###.#.#####.#', '#...#.#.....#', '#.###.#.###.#', '#.....#...#.#', '###########.#'] },
]
const runtimeConfig = {
  Stonegate: {
    keySpawnPools: { ruby: [[1, 3]], sapphire: [[3, 11]], emerald: [[5, 5]], amber: [[9, 7]] },
    hidingSpots: [{ id: 'stone-alcove-1', type: 'alcove', cell: [3, 1] }, { id: 'stone-alcove-2', type: 'alcove', cell: [7, 1] }],
    traps: [{ id: 'stone-plate-1', type: 'pressure', cell: [3, 2] }, { id: 'stone-plate-2', type: 'pressure', cell: [7, 4] }],
    mechanics: { requiredDoors: ['ruby', 'emerald', 'amber', 'sapphire'], requiredClues: ['dawn-note', 'dusk-note'], sprintDrain: 30, staminaRegen: 20, trapSlowSeconds: 1.5 },
    clues: [
      { id: 'dawn-note', name: 'Dawn journal', cell: [7, 10], subtitle: 'Field record · The changing paths', text: 'At dawn the old road was gone. In its place grew three trails, each returning to the same clearing. I carved names into the signs so I could find my way: Owl Watch above the crossroads, Moon Turn to the west, Fallen Arch to the south. The forest can move its shadows, but it has not yet learned to move my words. I left the Amber journal at the arch. Bring this record out with you.', hint: 'Find the Amber journal at Fallen Arch on the southern loop, then return to the Amber seal by Moon Turn. This Dawn record is required at the exit.' },
      { id: 'dusk-note', name: 'Dusk journal', cell: [9, 4], subtitle: 'Field record · The last watch', text: 'I hear someone patrolling with my footsteps. It stops at every gate I once guarded. Perhaps the oath kept my body here after the rest of me was gone. I left my last seal journal at Moon Hollow, in the northeast grove. Do not try to fight the watcher. Take the records to Last Bastion. If the road opens, keep walking until you can hear birds again.', hint: 'Find the Sapphire journal at Moon Hollow in the northeast. Open its seal near Last Bastion. All four inner seals and both field records are required to release the exit.' },
    ],
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
  return {
  ...level,
  id: level.name.toLowerCase().replaceAll(' ', '-'),
  theme: { Stonegate: 'stone', 'Amber Halls': 'timber', 'Twilight Labyrinth': 'temple' }[level.name],
  start: [0, 1],
  monster: { Stonegate: [[5, 1], [3, 5]], 'Amber Halls': [[5, 1], [3, 1]], 'Twilight Labyrinth': [[5, 1], [5, 5]] }[level.name],
  keys: (level.name === 'Stonegate' ? [
    { id: 'ruby', keyId: 'ruby', name: 'Ruby', color: '#ff5b68', cell: [1, 3] },
    { id: 'sapphire', keyId: 'sapphire', name: 'Sapphire', color: '#4dbbff', cell: [3, 11] },
    { id: 'emerald', keyId: 'emerald', name: 'Emerald', color: '#8ddca0', cell: [5, 5] },
    { id: 'amber', keyId: 'amber', name: 'Amber', color: '#ffd18b', cell: [9, 7] },
  ] : [
    { id: 'ruby', keyId: 'ruby', name: 'Ruby', color: '#ff5b68', cell: [1, 3] },
    { id: 'sapphire', keyId: 'sapphire', name: 'Sapphire', color: '#4dbbff', cell: { Stonegate: [5, 1], 'Amber Halls': [5, 3], 'Twilight Labyrinth': [5, 5] }[level.name] },
  ]),
  doors: [
    { id: 'ruby', keyId: 'ruby', name: 'Ruby', color: '#ff5b68', cell: [2, 3], axis: 'z' },
    { id: 'sapphire', keyId: 'sapphire', name: 'Sapphire', color: '#4dbbff', cell: { Stonegate: [11, 10], 'Amber Halls': [8, 9], 'Twilight Labyrinth': [8, 11] }[level.name], axis: level.name === 'Stonegate' ? 'x' : 'z' },
    { id: 'exit', name: 'Exit', color: '#ffd75b', cell: [rows.length - 1, rows[0].length - 2], axis: 'z', offset: -0.7 },
    ...(config.shortcut ? [config.shortcut] : []),
    ...(level.name === 'Stonegate' ? [
      { id: 'emerald', keyId: 'emerald', name: 'Emerald', color: '#8ddca0', cell: [6, 9], axis: 'z' },
      { id: 'amber', keyId: 'amber', name: 'Amber', color: '#ffd18b', cell: [8, 3], axis: 'z' },
    ] : []),
  ],
  end: [rows.length - 1, rows[0].length - 2],
  grid: rows.map(row => [...row].map(cell => cell === '#' ? 1 : 0)),
  keySpawnPools: config.keySpawnPools,
  hidingSpots: config.hidingSpots,
  traps: config.traps || [],
  shrines: config.shrines || [],
  noisyZones: config.noisyZones || [],
  mechanics: config.mechanics,
  clues: config.clues || [],
}})
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
