export const BLACKOUT_START = 45
export const BLACKOUT_DURATION = 12
export const BLACKOUT_FLICKER = 3
export const BLACKOUT_END = BLACKOUT_START+BLACKOUT_FLICKER+BLACKOUT_DURATION

export function lightpostPower(seconds) {
  if(seconds<BLACKOUT_START || seconds>=BLACKOUT_END) return 1
  const since=seconds-BLACKOUT_START
  // Flicker briefly, then remain fully dark for twelve seconds.
  return since<BLACKOUT_FLICKER ? Math.floor(since*4)%3===0 ? 1 : 0 : 0
}

export function blackoutPhase(seconds) {
  return seconds<BLACKOUT_START || seconds>=BLACKOUT_END ? 'normal' : seconds<BLACKOUT_START+BLACKOUT_FLICKER ? 'flickering' : 'dark'
}

export function createBlackoutState() {
  return {phase:'waiting',elapsed:0}
}

// Latch the event when its trigger is crossed. A delayed timer/render must
// never jump straight from before the blackout to after it.
export function advanceBlackout(state,runSeconds,deltaSeconds) {
  if(state.phase==='waiting') return runSeconds>=BLACKOUT_START ? {phase:'flickering',elapsed:0} : state
  if(state.phase==='done') return state
  const elapsed=state.elapsed+Math.max(0,Math.min(Number.isFinite(deltaSeconds)?deltaSeconds:0,0.25))
  const duration=state.phase==='flickering'?BLACKOUT_FLICKER:BLACKOUT_DURATION
  if(elapsed+1e-9>=duration) return {phase:state.phase==='flickering'?'dark':'done',elapsed:0}
  return {...state,elapsed}
}

export function blackoutPower(state) {
  return state.phase==='dark'?0:state.phase==='flickering'?lightpostPower(BLACKOUT_START+state.elapsed):1
}

export function blackoutRemaining(state) {
  return Math.ceil(state.phase==='flickering'?BLACKOUT_FLICKER-state.elapsed+BLACKOUT_DURATION:state.phase==='dark'?BLACKOUT_DURATION-state.elapsed:0)
}
