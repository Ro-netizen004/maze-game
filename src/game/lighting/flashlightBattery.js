export const FLASHLIGHT_BATTERY_MAX = 100
export const FLASHLIGHT_DRAIN_PER_SECOND = 100 / 300
export const FLASHLIGHT_RECHARGE_PER_SECOND = 2
export const FLASHLIGHT_LOW_THRESHOLD = 20

export function updateFlashlightBattery(
  battery,
  elapsedSeconds,
  flashlightOn,
  drainRate = FLASHLIGHT_DRAIN_PER_SECOND,
  rechargeRate = FLASHLIGHT_RECHARGE_PER_SECOND,
) {
  if (!Number.isFinite(battery)) battery = FLASHLIGHT_BATTERY_MAX
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return Math.max(0, Math.min(FLASHLIGHT_BATTERY_MAX, battery))
  }
  const rate = flashlightOn ? -Math.max(0, drainRate) : Math.max(0, rechargeRate)
  return Math.max(0, Math.min(FLASHLIGHT_BATTERY_MAX, battery + rate * elapsedSeconds))
}

export function flashlightBatteryStatus(battery, flashlightOn) {
  if (battery <= 0) return 'Depleted'
  if (flashlightOn && battery <= FLASHLIGHT_LOW_THRESHOLD) return 'Low · flickering'
  return flashlightOn ? 'On' : 'Recharging'
}
