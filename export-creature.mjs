import { mkdir, writeFile } from 'node:fs/promises'
import { AnimationClip, VectorKeyframeTrack, QuaternionKeyframeTrack } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { createDeepSeaCreature } from './src/deepSeaCreature.js'

// GLTFExporter uses this browser API to package binary buffers.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.() }) }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.() }) }
}

const clips = []
for (const [name, duration, moving, chasing] of [
  ['Idle', 3.6, false, false], ['Walk', 2 * Math.PI / 5.5, true, false],
  ['Run', 2 * Math.PI / 9, true, true], ['Attack', 1.2, false, true],
]) {
  const creature = createDeepSeaCreature()
  const objects = []
  creature.group.traverse(object => { object.name = `joint_${objects.length}`; objects.push(object) })
  // Warm up movement blending before recording a loop.
  for (let i = 0; i < 120; i++) creature.update(1 / 60, moving, chasing)
  const samples = objects.map(() => ({ position: [], quaternion: [], scale: [] }))
  const count = Math.ceil(duration * 30)
  const times = []
  for (let frame = 0; frame <= count; frame++) {
    const t = frame / count * duration
    times.push(t)
    if (frame) creature.update(duration / count, moving, chasing)
    objects.forEach((object, index) => {
      const position = object.position.toArray()
      const quaternion = object.quaternion.toArray()
      if (name === 'Attack' && object === creature.group) {
        position[2] += Math.sin(t / duration * Math.PI) * 0.18
        quaternion[0] = Math.sin(-Math.sin(t / duration * Math.PI) * 0.08)
        quaternion[3] = Math.cos(-Math.sin(t / duration * Math.PI) * 0.08)
      }
      samples[index].position.push(...position)
      samples[index].quaternion.push(...quaternion)
      samples[index].scale.push(...object.scale.toArray())
    })
  }
  const tracks = []
  objects.forEach((object, index) => {
    for (const property of ['position', 'quaternion', 'scale']) {
      const values = samples[index][property]
      const width = property === 'quaternion' ? 4 : 3
      // Close each cycle without a discontinuity at the loop boundary.
      values.splice(values.length - width, width, ...values.slice(0, width))
      if (values.every((value, i) => Math.abs(value - values[i % width]) < 0.000001)) continue
      const Track = property === 'quaternion' ? QuaternionKeyframeTrack : VectorKeyframeTrack
      tracks.push(new Track(`${object.name}.${property}`, times, values))
    }
  })
  clips.push(new AnimationClip(name, duration, tracks))
  creature.dispose()
}
const creature = createDeepSeaCreature()
let index = 0
creature.group.traverse(object => { object.name = `joint_${index++}` })
const binary = await new GLTFExporter().parseAsync(creature.group, { binary: true, animations: clips, onlyVisible: true })
await mkdir('public/models/abyssal-stalker', { recursive: true })
await writeFile('public/models/abyssal-stalker/monster.glb', Buffer.from(binary))
creature.dispose()
console.log(`Exported own creature: ${binary.byteLength} bytes; ${clips.map(clip => clip.name).join(', ')}`)
