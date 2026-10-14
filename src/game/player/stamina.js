export const SPRINT_RECOVERY_THRESHOLD = 25

export function advanceStamina(stamina, elapsed, wantsSprint, exhausted, drain, regen) {
  if (exhausted && stamina >= SPRINT_RECOVERY_THRESHOLD) exhausted = false
  const sprinting = wantsSprint && !exhausted && stamina > 0
  const next = Math.max(0, Math.min(100, stamina + (sprinting ? -drain : regen) * elapsed))
  return { stamina: next, sprinting, exhausted: exhausted || (sprinting && next === 0) }
}
