import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceStamina } from '../src/game/player/stamina.js'

test('empty stamina prevents repeated sprint taps until a quarter charge recovers', () => {
  const empty = advanceStamina(3, 0.1, true, false, 30, 12)
  assert.equal(empty.stamina, 0)
  assert.equal(empty.exhausted, true)
  const recovering = advanceStamina(empty.stamina, 1, true, empty.exhausted, 30, 12)
  assert.equal(recovering.sprinting, false)
  assert.equal(recovering.stamina, 12)
  assert.equal(advanceStamina(24, 0.05, true, true, 30, 12).sprinting, false)
  assert.equal(advanceStamina(25, 0.05, true, true, 30, 12).sprinting, true)
})

test('sprint lasts about three seconds and resting recovers without overshooting', () => {
  assert.ok(advanceStamina(100, 3, true, false, 30, 12).stamina <= 10)
  assert.equal(advanceStamina(100, 4, true, false, 30, 12).stamina, 0)
  assert.equal(advanceStamina(90, 2, false, false, 30, 12).stamina, 100)
})
