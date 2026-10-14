import { AnimationMixer } from 'three'

export function createMonsterPlayback(scene, clips) {
  const mixer = new AnimationMixer(scene)
  const actions = Object.fromEntries(clips.map(clip => [clip.name, mixer.clipAction(clip)]))
  for (const name of ['Idle', 'Walk', 'Run', 'Attack']) {
    if (!actions[name]) throw Error(`Missing monster animation: ${name}`)
  }
  let current = actions.Idle
  current.play()
  return {
    update(name, delta) {
      const next = actions[name] || actions.Idle
      if (next !== current) {
        next.reset().play()
        current.crossFadeTo(next, 0.18, false)
        current = next
      }
      mixer.update(delta)
    },
    dispose() { mixer.stopAllAction(); mixer.uncacheRoot(scene) },
  }
}
