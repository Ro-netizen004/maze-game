import { cellPosition } from './levels.js'
import { hasLineOfSight } from './levelRuntime.js'
import { findPath, worldCell } from './navigation.js'

export const guardianDifficultyPresets = Object.freeze({
  easy: Object.freeze({
    sightRange: 6,
    fieldOfView: 75,
    hearingRange: 3,
    searchDuration: 3,
    patrolSpeed: 1.05,
    investigateSpeed: 1.2,
    chaseSpeed: 3.3,
  }),
  normal: Object.freeze({
    sightRange: 14,
    fieldOfView: 110,
    hearingRange: 7,
    searchDuration: 11,
    patrolSpeed: 2.1,
    investigateSpeed: 3.6,
    chaseSpeed: 4.8,
  }),
  hard: Object.freeze({
    sightRange: 18,
    fieldOfView: 135,
    hearingRange: 10,
    searchDuration: 16,
    patrolSpeed: 2.5,
    investigateSpeed: 4.3,
    chaseSpeed: 5.5,
  }),
})

export function resolveGuardianDifficulty(difficulty = 'normal', overrides = {}, litRunes = 0) {
  const preset = typeof difficulty === 'string'
    ? guardianDifficultyPresets[difficulty] || guardianDifficultyPresets.normal
    : difficulty
  const base = { ...guardianDifficultyPresets.normal, ...preset, ...overrides }
  const pressure = Math.max(0, Math.min(5, litRunes)) * (difficulty === 'easy' ? 0.4 : 1)
  return { ...base, sightRange: base.sightRange + pressure, hearingRange: base.hearingRange + pressure * 0.5,
    searchDuration: base.searchDuration + pressure, patrolSpeed: base.patrolSpeed + pressure * 0.12,
    investigateSpeed: base.investigateSpeed + pressure * 0.16, chaseSpeed: base.chaseSpeed + pressure * 0.22 }
}

// Real world sight avoids treating entire decorative grid cells as safe zones.
export function forestLineOfSight(level, from, to) {
  const dx = to[0] - from[0], dz = to[1] - from[1], lengthSquared = dx * dx + dz * dz
  if (lengthSquared < 0.001) return true
  const radius = 0.45
  for (let r = 0; r < level.grid.length; r++) for (let c = 0; c < level.grid[r].length; c++) {
    if (!level.grid[r][c]) continue
    const [x, z] = cellPosition(level, [r, c])
    // Being inside scenery must not grant the freely moving player immunity.
    if (Math.hypot(x - to[0], z - to[1]) <= radius || Math.hypot(x - from[0], z - from[1]) <= radius) continue
    const t = ((x - from[0]) * dx + (z - from[1]) * dz) / lengthSquared
    if (t > 0 && t < 1 && Math.hypot(x - from[0] - t * dx, z - from[1] - t * dz) < radius) return false
  }
  return true
}

export function createGuardianState() {
  return {
    mode: 'patrol',
    lastKnownPosition: null,
    targetPosition: null,
    searchRemaining: 0,
    lastNoiseId: null,
  }
}

const planarDistance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

export function readPlayerNoise(source) {
  return source && 'current' in source ? source.current : source
}

export function canSeePlayer({
  level, openedDoors = [], guardianPosition, guardianFacing, playerPosition,
  playerHidden = false, config = guardianDifficultyPresets.normal,
}) {
  if (playerHidden) return false
  const dx = playerPosition[0] - guardianPosition[0]
  const dz = playerPosition[1] - guardianPosition[1]
  const distance = Math.hypot(dx, dz)
  if (distance > config.sightRange) return false
  if (distance > 0.001) {
    const facingLength = Math.hypot(guardianFacing[0], guardianFacing[1]) || 1
    const dot = (dx * guardianFacing[0] + dz * guardianFacing[1]) / (distance * facingLength)
    const limit = Math.cos(config.fieldOfView * Math.PI / 360)
    if (dot < limit) return false
  }
  if (level.openForest) return forestLineOfSight(level, guardianPosition, playerPosition)
  return hasLineOfSight(
    level,
    worldCell(level, guardianPosition[0], guardianPosition[1]),
    worldCell(level, playerPosition[0], playerPosition[1]),
    openedDoors,
  )
}

export function noiseWorldPosition(level, noise) {
  if (noise.position) return [...noise.position]
  return cellPosition(level, noise.cell)
}

export function canHearNoise({ level, guardianPosition, noise, config = guardianDifficultyPresets.normal }) {
  if (!noise || noise.intensity <= 0) return false
  if (noise.source === 'ritual') return true
  const position = noiseWorldPosition(level, noise)
  return planarDistance(guardianPosition, position) <= config.hearingRange + noise.intensity
}

export function updateGuardianState(state, input) {
  const {
    dt = 0, level, openedDoors = [], guardianPosition, guardianFacing,
    playerPosition, playerHidden = false, noise = null, targetReached = false,
    config = guardianDifficultyPresets.normal,
  } = input
  const next = {
    ...state,
    lastKnownPosition: state.lastKnownPosition && [...state.lastKnownPosition],
    targetPosition: state.targetPosition && [...state.targetPosition],
  }
  const seesPlayer = canSeePlayer({
    level, openedDoors, guardianPosition, guardianFacing, playerPosition, playerHidden, config,
  })
  const isNewNoise = noise && noise.id !== state.lastNoiseId
  const hearsNoise = isNewNoise && canHearNoise({ level, guardianPosition, noise, config })
    && (level.openForest || findPath(level, worldCell(level, ...guardianPosition), worldCell(level, ...noiseWorldPosition(level, noise)), openedDoors).length > 0)

  if (isNewNoise) next.lastNoiseId = noise.id
  if (seesPlayer) {
    next.mode = 'chase'
    next.lastKnownPosition = [...playerPosition]
    next.targetPosition = [...playerPosition]
    next.searchRemaining = config.searchDuration
    return next
  }
  if (hearsNoise) {
    const heardAt = noiseWorldPosition(level, noise)
    next.mode = 'investigate'
    next.lastKnownPosition = heardAt
    next.targetPosition = heardAt
    next.searchRemaining = config.searchDuration
    return next
  }

  if (state.mode === 'chase') {
    next.mode = 'search'
    next.targetPosition = next.lastKnownPosition
    next.searchRemaining = config.searchDuration
  } else if (state.mode === 'investigate' && targetReached) {
    next.mode = 'search'
    next.searchRemaining = config.searchDuration
  } else if (state.mode === 'search' || state.mode === 'investigate') {
    next.searchRemaining = Math.max(0, state.searchRemaining - dt)
    if (next.searchRemaining === 0) {
      next.mode = 'patrol'
      next.targetPosition = null
      next.lastKnownPosition = null
    }
  }
  return next
}

export function guardianSpeed(state, config = guardianDifficultyPresets.normal) {
  if (state.mode === 'chase') return config.chaseSpeed
  if (state.mode === 'investigate' || state.mode === 'search') return config.investigateSpeed
  return config.patrolSpeed
}
