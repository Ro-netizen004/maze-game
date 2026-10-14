import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Box3 } from 'three'
import { createMonsterPlayback } from '../src/game/guardian/monsterPlayback.js'

test('local monster GLB plays all clips and survives animation setup twice', async () => {
  const bytes = await readFile(new URL('../public/models/abyssal-stalker/monster.glb', import.meta.url))
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
  assert.deepEqual(gltf.animations.map(clip => clip.name), ['Idle', 'Walk', 'Run', 'Attack'])
  const scene = gltf.scene.clone(true)
  for (let setup = 0; setup < 2; setup++) {
    const playback = createMonsterPlayback(scene, gltf.animations)
    for (const name of ['Idle', 'Walk', 'Run', 'Attack', 'Idle']) {
      for (let frame = 0; frame < 90; frame++) {
        playback.update(name, 1 / 60)
        scene.updateMatrixWorld(true)
        const box = new Box3().setFromObject(scene)
        assert.ok(box.max.y > 2 && box.max.y < 3)
        assert.ok(Number.isFinite(box.min.x))
      }
    }
    playback.dispose()
  }
})
