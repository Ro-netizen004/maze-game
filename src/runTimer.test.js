import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceTimer, formatTime } from './runTimer.js'

test('timer advances only while active', () => {
  assert.equal(advanceTimer(1000, 10, 60, true), 1050)
  assert.equal(advanceTimer(1000, 10, 60, false), 1000)
  assert.equal(advanceTimer(1000, null, 60, true), 1000)
  assert.equal(advanceTimer(1000, 60, 10, true), 1000)
})

test('timer formatting uses minutes, seconds, and tenths', () => {
  assert.equal(formatTime(0), '0:00.0')
  assert.equal(formatTime(65432), '1:05.4')
  assert.equal(formatTime(undefined), '—')
})
