const cellId = cell => cell.join(',')

export function hashSeed(seed) {
  let hash = 2166136261
  for (const character of String(seed)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function seededRandom(seed) {
  let value = hashSeed(seed)
  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ result >>> 15, result | 1)
    result ^= result + Math.imul(result ^ result >>> 7, result | 61)
    return ((result ^ result >>> 14) >>> 0) / 4294967296
  }
}

export function createSeededLevel(template, seed = template.id || template.name) {
  const random = seededRandom(seed)
  const used = new Set()
  const keys = template.keys.map(key => {
    const pool = template.keySpawnPools?.[key.id] || [key.cell]
    const available = pool.filter(cell => !used.has(cellId(cell)))
    const choices = available.length ? available : pool
    const cell = [...choices[Math.floor(random() * choices.length)]]
    used.add(cellId(cell))
    return { ...key, cell }
  })
  return {
    ...template,
    seed: String(seed),
    keys,
    doors: template.doors.map(door => ({ ...door, cell: [...door.cell] })),
    hidingSpots: (template.hidingSpots || []).map(item => ({ ...item, cell: [...item.cell] })),
    traps: (template.traps || []).map(item => ({ ...item, cell: [...item.cell] })),
    shrines: (template.shrines || []).map(item => ({ ...item, cell: [...item.cell] })),
    rituals: (template.rituals || []).map(item => ({ ...item, cell: [...item.cell] })),
    noisyZones: (template.noisyZones || []).map(item => ({ ...item, cell: [...item.cell] })),
    mechanics: { ...template.mechanics },
    clues: (template.clues || []).map(clue => ({ ...clue, cell: [...clue.cell] })),
  }
}

export function getLockedDoors(level, openedDoors = []) {
  const opened = new Set(openedDoors)
  return (level.doors || []).filter(door => !opened.has(door.id))
}

export function getLockedCellIds(level, openedDoors = []) {
  return new Set(getLockedDoors(level, openedDoors).map(door => cellId(door.cell)))
}

export function isWalkableCell(level, cell, openedDoors = []) {
  const id = cellId(cell)
  const openDoorway = (level.doors || []).some(door => cellId(door.cell) === id && openedDoors.includes(door.id))
  return (level.grid[cell[0]]?.[cell[1]] === 0 || openDoorway) && !getLockedCellIds(level, openedDoors).has(id)
}

export function reachableCells(level, start = level.start, openedDoors = []) {
  const locked = getLockedCellIds(level, openedDoors)
  const visited = new Set()
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const [row, column] = queue[head]
    const id = `${row},${column}`
    const openDoorway = (level.doors || []).some(door => cellId(door.cell) === id && openedDoors.includes(door.id))
    if (visited.has(id) || (level.grid[row]?.[column] !== 0 && !openDoorway) || locked.has(id)) continue
    visited.add(id)
    queue.push([row + 1, column], [row - 1, column], [row, column + 1], [row, column - 1])
  }
  return visited
}

export function canOpenDoor(level, door, collectedKeys = [], openedDoors = [], activatedShrines = [], collectedClues = []) {
  if (door.id === 'exit') {
    const required = level.mechanics?.requiredDoors || level.doors.filter(item => item.id !== 'exit' && item.kind !== 'shortcut').map(item => item.id)
    return required.every(id => openedDoors.includes(id)) && (level.mechanics?.requiredClues || []).every(id => collectedClues.includes(id))
  }
  if (door.kind === 'shortcut') {
    return (door.requiresKeys || []).every(id => collectedKeys.includes(id))
      && (door.requiresShrines || []).every(id => activatedShrines.includes(id))
  }
  return !door.keyId || collectedKeys.includes(door.keyId)
}

export function isLevelSolvable(level) {
  const keys = new Set()
  const opened = new Set()
  const clues = new Set()
  let changed = true
  while (changed) {
    changed = false
    const reachable = reachableCells(level, level.start, [...opened])
    for (const key of level.keys) {
      if (reachable.has(cellId(key.cell)) && !keys.has(key.id)) {
        keys.add(key.id)
        changed = true
      }
    }
    for (const clue of level.clues || []) {
      if (reachable.has(cellId(clue.cell)) && !clues.has(clue.id)) { clues.add(clue.id); changed = true }
    }
    for (const door of level.doors) {
      if (door.kind === 'shortcut' || opened.has(door.id) || !canOpenDoor(level, door, [...keys], [...opened], [], [...clues])) continue
      const [row, column] = door.cell
      const adjacent = [[row + 1, column], [row - 1, column], [row, column + 1], [row, column - 1]]
      if (adjacent.some(cell => reachable.has(cellId(cell)))) {
        opened.add(door.id)
        changed = true
      }
    }
  }
  return reachableCells(level, level.start, [...opened]).has(cellId(level.end))
}

// Grid LOS is intentionally conservative: walls and closed doors both occlude.
export function hasLineOfSight(level, from, to, openedDoors = []) {
  let [row, column] = from
  const [targetRow, targetColumn] = to
  const rowStep = Math.sign(targetRow - row)
  const columnStep = Math.sign(targetColumn - column)
  const rowDistance = Math.abs(targetRow - row)
  const columnDistance = Math.abs(targetColumn - column)
  let error = rowDistance - columnDistance
  while (true) {
    if ((row !== from[0] || column !== from[1]) && !isWalkableCell(level, [row, column], openedDoors)) return false
    if (row === targetRow && column === targetColumn) return true
    const doubled = error * 2
    if (doubled > -columnDistance) { error -= columnDistance; row += rowStep }
    if (doubled < rowDistance) { error += rowDistance; column += columnStep }
  }
}

export function createNoise(cell, intensity = 1, source = 'movement') {
  return { cell: [...cell], intensity: Math.max(0, intensity), source }
}

export function noiseAtDistance(noise, cell) {
  const distance = Math.abs(noise.cell[0] - cell[0]) + Math.abs(noise.cell[1] - cell[1])
  return Math.max(0, noise.intensity - distance)
}
