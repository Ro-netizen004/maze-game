import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Box3, Vector3 } from 'three'
import { createCustomMonsterRig } from '../src/game/guardian/customMonsterRig.js'

test('custom GLB joints animate and preserve source geometry across restarts', async () => {
  const bytes = await readFile(new URL('../public/models/custom-stalker/monster.glb', import.meta.url))
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
  const original = new Box3().setFromObject(gltf.scene).getSize(new Vector3())
  for (let attempt = 0; attempt < 2; attempt++) {
    const rig = createCustomMonsterRig(gltf.scene)
    const size = new Box3().setFromObject(rig.group).getSize(new Vector3())
    assert.ok(size.y > 2.5 && size.y <= 2.73, `height ${size.y}`)
    assert.ok(size.x / size.y < original.x / original.y * 0.8, 'silhouette should be lankier')
    assert.ok(size.x <= 1.36 && size.z <= 1.36)
    assert.ok(rig.joints.legs.every(leg => leg.hip.children.length > 1 && leg.knee.children.length > 1))
    const poses = new Set()
    const leans = []
    const mouthPoses = new Set()
    for (let frame = 0; frame < 300; frame++) {
      rig.update(1 / 60, true, frame > 60)
      poses.add(rig.joints.legs[0].hip.rotation.x.toFixed(3))
      leans.push(rig.joints.upper.rotation.z)
      mouthPoses.add(rig.joints.jaw.rotation.x.toFixed(3))
      const box = new Box3().setFromObject(rig.group)
      assert.ok(Number.isFinite(box.max.y) && box.max.y < 3)
      assert.ok(box.max.x - box.min.x < 1.5, 'sway must fit inside corridor clearance')
      assert.ok(box.min.y > -0.2, `foot below floor: ${box.min.y}`)
    }
    assert.ok(poses.size > 30)
    assert.ok(rig.joints.jaw.children.length > 1 && mouthPoses.size > 20, 'lower teeth must move with the breathing jaw')
    assert.ok(Math.min(...leans) < -0.07 && Math.max(...leans) > 0.07, 'torso must hang in both directions')
    rig.update(1 / 60, false, false, true)
    assert.ok(rig.joints.arms[0].shoulder.rotation.x < -0.4)
    rig.dispose()
  }
  assert.deepEqual(new Box3().setFromObject(gltf.scene).getSize(new Vector3()), original)
})
