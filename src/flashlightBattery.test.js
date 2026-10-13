import test from 'node:test'
import assert from 'node:assert/strict'
import {
  FLASHLIGHT_BATTERY_MAX,
  flashlightBatteryStatus,
  updateFlashlightBattery,
} from './flashlightBattery.js'

test('flashlight battery drains while on and recharges while off', () => {
  assert.equal(updateFlashlightBattery(80, 4, true, 2.5, 1), 70)
  assert.equal(updateFlashlightBattery(80, 4, false, 2.5, 1), 84)
})

test('flashlight battery clamps and ignores invalid elapsed time', () => {
  assert.equal(updateFlashlightBattery(2, 2, true, 2.5, 1), 0)
  assert.equal(updateFlashlightBattery(99, 2, false, 2.5, 1), FLASHLIGHT_BATTERY_MAX)
  assert.equal(updateFlashlightBattery(50, -1, true), 50)
})

test('flashlight status reports low and depleted states', () => {
  assert.equal(flashlightBatteryStatus(15, true), 'Low · flickering')
  assert.equal(flashlightBatteryStatus(15, false), 'Recharging')
  assert.equal(flashlightBatteryStatus(0, false), 'Depleted')
})
