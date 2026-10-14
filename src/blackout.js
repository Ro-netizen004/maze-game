export const BLACKOUT_START = 45
export const BLACKOUT_DURATION = 12
export const BLACKOUT_FLICKER = 1.2
export const BLACKOUT_END = BLACKOUT_START+BLACKOUT_FLICKER+BLACKOUT_DURATION

export function lightpostPower(seconds) {
  if(seconds<BLACKOUT_START || seconds>=BLACKOUT_END) return 1
  const since=seconds-BLACKOUT_START
  // Flicker briefly, then remain fully dark for twelve seconds.
  return since<BLACKOUT_FLICKER ? Math.floor(since*12)%3===0 ? 0.65 : 0 : 0
}

export function blackoutPhase(seconds) {
  return seconds<BLACKOUT_START || seconds>=BLACKOUT_END ? 'normal' : seconds<BLACKOUT_START+BLACKOUT_FLICKER ? 'flickering' : 'dark'
}
