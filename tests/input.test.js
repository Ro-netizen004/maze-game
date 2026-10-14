import test from 'node:test'
import assert from 'node:assert/strict'
import { createInputState, readInput } from '../src/game/player/input.js'

test('keyboard and touch controls share one input shape', () => {
  assert.deepEqual(createInputState(), { forward: 0, right: 0, jump: false, interact: false, sprint: false })
  const input = readInput(new Set(['KeyW', 'ShiftLeft']), { right: -0.5, interact: true })
  assert.deepEqual(input, { forward: 1, right: -0.5, jump: false, interact: true, sprint: true })
})

test('combined axes remain normalized', () => {
  assert.equal(readInput(new Set(['KeyW']), { forward: 0.8 }).forward, 1)
  assert.equal(readInput(new Set(['KeyS']), { forward: -0.8 }).forward, -1)
})
