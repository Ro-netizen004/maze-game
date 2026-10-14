export function createInputState() {
  return { forward: 0, right: 0, jump: false, interact: false, sprint: false }
}

export function readInput(keys, touch = {}) {
  return {
    forward: clampAxis(Number(keys.has('KeyW')) - Number(keys.has('KeyS')) + (touch.forward || 0)),
    right: clampAxis(Number(keys.has('KeyD')) - Number(keys.has('KeyA')) + (touch.right || 0)),
    jump: keys.has('Space') || Boolean(touch.jump),
    interact: keys.has('KeyE') || Boolean(touch.interact),
    sprint: keys.has('ShiftLeft') || keys.has('ShiftRight') || Boolean(touch.sprint),
  }
}

function clampAxis(value) {
  return Math.max(-1, Math.min(1, value))
}
