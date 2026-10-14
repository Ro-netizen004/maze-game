import test from 'node:test'
import assert from 'node:assert/strict'
import { readPlayerNoise, canHearNoise } from '../src/game/guardian/guardianAI.js'

test('an empty noise ref is silence until the player makes a sound', () => {
  const ref = { current: null }
  assert.equal(readPlayerNoise(ref), null)
  assert.equal(canHearNoise({ noise: readPlayerNoise(ref) }), false)
  const footstep = { id: 1, cell: [1, 1], intensity: 2 }
  ref.current = footstep
  assert.equal(readPlayerNoise(ref), footstep)
  assert.equal(readPlayerNoise(footstep), footstep)
  assert.equal(readPlayerNoise(null), null)
})
