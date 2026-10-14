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
    chaseSpeed: 1.8,
  }),
  normal: Object.freeze({
    sightRange: 8,
    fieldOfView: 95,
    hearingRange: 4.5,
    searchDuration: 5,
    patrolSpeed: 1.3,
    investigateSpeed: 1.55,
    chaseSpeed: 2.2,
  }),
  hard: Object.freeze({
    sightRange: 14,
    fieldOfView: 145,
    hearingRange: 8,
    searchDuration: 16,
    patrolSpeed: 2.2,
    investigateSpeed: 3.4,
    chaseSpeed: 4.7,
    flashlightRange: 19,
    exposureMemory: 25,
  }),
})

export function resolveGuardianDifficulty(difficulty = 'normal', overrides = {}) {
  const preset = typeof difficulty === 'string'
    ? guardianDifficultyPresets[difficulty] || guardianDifficultyPresets.normal
    : difficulty
  return { ...guardianDifficultyPresets.normal, ...preset, ...overrides }
}

export function createGuardianState() {
  return {
    mode: 'patrol',
    lastKnownPosition: null,
    targetPosition: null,
    searchRemaining: 0,
    lastNoiseId: null,
    exposedRemaining: 0,
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
  const position = noiseWorldPosition(level, noise)
  return planarDistance(guardianPosition, position) <= config.hearingRange + noise.intensity
}

export function updateGuardianState(state, input) {
  const {
    dt = 0, level, openedDoors = [], guardianPosition, guardianFacing,
    playerPosition, playerHidden = false, noise = null, targetReached = false,
    config = guardianDifficultyPresets.normal, flashlightExposure = false,
  } = input
  const next = {
    ...state,
    exposedRemaining: Math.max(0,(state.exposedRemaining||0)-dt),
    lastKnownPosition: state.lastKnownPosition && [...state.lastKnownPosition],
    targetPosition: state.targetPosition && [...state.targetPosition],
  }
  const seesPlayer = canSeePlayer({
    level, openedDoors, guardianPosition, guardianFacing, playerPosition, playerHidden, config,
  })
  const isNewNoise = noise && noise.id !== state.lastNoiseId
  const hearsNoise = isNewNoise && canHearNoise({ level, guardianPosition, noise, config })
    && findPath(level, worldCell(level, ...guardianPosition), worldCell(level, ...noiseWorldPosition(level, noise)), openedDoors).length > 0

  if (isNewNoise) next.lastNoiseId = noise.id
  if (seesPlayer || flashlightExposure) {
    if(flashlightExposure) next.exposedRemaining=config.exposureMemory||15
    next.mode = 'chase'
    next.lastKnownPosition = [...playerPosition]
    next.targetPosition = [...playerPosition]
    next.searchRemaining = config.searchDuration
    return next
  }
  // Once a hidden player reveals their shelter, keep approaching that known
  // position briefly even after they switch the beam off.
  if(playerHidden && next.exposedRemaining>0 && next.lastKnownPosition) {
    next.mode='chase'
    next.targetPosition=[...next.lastKnownPosition]
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
