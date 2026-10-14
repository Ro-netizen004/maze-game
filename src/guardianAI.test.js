import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canHearNoise,
  canSeePlayer,
  createGuardianState,
  guardianDifficultyPresets,
  updateGuardianState,
} from './guardianAI.js'
import { cellPosition, levels } from './mazeFixtures.js'

const level = levels[0]
const config = guardianDifficultyPresets.normal

function input(overrides = {}) {
  const guardianPosition = cellPosition(level, [3, 3])
  return {
    dt: 0.1,
    level,
    openedDoors: ['ruby'],
    guardianPosition,
    guardianFacing: [0, -1],
    playerPosition: cellPosition(level, [1, 3]),
    playerHidden: false,
    config,
    ...overrides,
  }
}

test('wall-aware sight respects range, field of view, walls, and hiding', () => {
  const visible = input()
  assert.equal(canSeePlayer(visible), true)
  assert.equal(canSeePlayer({ ...visible, guardianFacing: [0, 1] }), false, 'player behind guardian')
  assert.equal(canSeePlayer({ ...visible, playerHidden: true }), false)
  assert.equal(canSeePlayer({ ...visible, playerPosition: cellPosition(level, [3, 1]) }), false, 'wall blocks diagonal sight')
  assert.equal(canSeePlayer({ ...visible, config: { ...config, sightRange: 2 } }), false)
})

test('hearing scales with action intensity', () => {
  const guardianPosition = cellPosition(level, [3, 3])
  const distantCell = [7, 3]
  assert.equal(canHearNoise({ level, guardianPosition, noise: { cell: distantCell, intensity: 2 }, config }), false)
  assert.equal(canHearNoise({ level, guardianPosition, noise: { cell: distantCell, intensity: 5 }, config }), true)
})

test('guardian transitions patrol to chase then searches last-known position', () => {
  const initial = createGuardianState()
  const chasing = updateGuardianState(initial, input())
  assert.equal(chasing.mode, 'chase')
  assert.deepEqual(chasing.lastKnownPosition, input().playerPosition)

  const hidden = updateGuardianState(chasing, input({ playerHidden: true }))
  assert.equal(hidden.mode, 'search')
  assert.deepEqual(hidden.targetPosition, chasing.lastKnownPosition)

  const done = updateGuardianState(
    { ...hidden, searchRemaining: 0.05 },
    input({ dt: 0.1, playerHidden: true, targetReached: true }),
  )
  assert.equal(done.mode, 'patrol')
  assert.equal(done.lastKnownPosition, null)
})

test('new noises trigger investigation and arrival begins search', () => {
  const noise = { id: 1, cell: [3, 2], intensity: 2, source: 'step' }
  const investigating = updateGuardianState(
    createGuardianState(),
    input({ playerHidden: true, noise }),
  )
  assert.equal(investigating.mode, 'investigate')
  assert.deepEqual(investigating.targetPosition, cellPosition(level, noise.cell))

  const searching = updateGuardianState(
    investigating,
    input({ playerHidden: true, noise, targetReached: true }),
  )
  assert.equal(searching.mode, 'search')
})

test('footsteps across a locked gate do not trap the guardian in investigation', () => {
  const noise = { id: 10, cell: [1, 3], intensity: 7 }
  const closed = updateGuardianState(createGuardianState(), input({ openedDoors: [], playerHidden: true, noise }))
  assert.equal(closed.mode, 'patrol')
  assert.equal(closed.lastNoiseId, 10)
  const opened = updateGuardianState(createGuardianState(), input({ openedDoors: ['ruby'], playerHidden: true, noise }))
  assert.equal(opened.mode, 'investigate')
})

test('search and investigation time out even when the target cannot be reached', () => {
  for (const mode of ['search', 'investigate']) {
    const state = { ...createGuardianState(), mode, targetPosition: cellPosition(level, [1, 3]), searchRemaining: 0.05 }
    const next = updateGuardianState(state, input({ playerHidden: true, targetReached: false, dt: 0.1 }))
    assert.equal(next.mode, 'patrol')
    assert.equal(next.targetPosition, null)
  }
})
