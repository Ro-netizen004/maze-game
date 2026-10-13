export function advanceTimer(elapsed, previousNow, now, active) {
  if (!active || previousNow == null) return elapsed
  return elapsed + Math.max(0, now - previousNow)
}

export function formatTime(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return '—'
  const totalTenths = Math.floor(milliseconds / 100)
  const minutes = Math.floor(totalTenths / 600)
  const seconds = Math.floor((totalTenths % 600) / 10)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${totalTenths % 10}`
}
