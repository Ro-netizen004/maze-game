import { Box3, Group, Vector3, Color } from 'three'

// The imported model has independent parts; attach each chain to joint pivots.
export function createCustomMonsterRig(source) {
  const root = new Group(), body = new Group(), model = source.clone(true)
  root.add(body); body.add(model)
  const box = new Box3().setFromObject(model), size = box.getSize(new Vector3())
  const proportions = new Vector3(0.78, 1.1, 0.88)
  const scale = Math.min(2.72 / (size.y * proportions.y), 1.25 / (size.x * proportions.x), 1.25 / (size.z * proportions.z))
  proportions.multiplyScalar(scale)
  model.scale.multiply(proportions)
  model.position.set(-(box.min.x + box.max.x) * proportions.x / 2, -box.min.y * proportions.y + 0.03, -(box.min.z + box.max.z) * proportions.z / 2)
  root.updateMatrixWorld(true)
  const parts = new Map(), materials = new Map()
  model.traverse(object => {
    if (!object.isMesh && object.name && object.children.some(child => child.isMesh)) parts.set(object.name.replaceAll('_', ' '), object)
    if (!object.isMesh) return
    object.castShadow = true; object.receiveShadow = true
    const original = object.material
    if (!materials.has(original)) {
      const material = original.clone(), name = object.name.toLowerCase().replaceAll('_', ' ')
      material.roughness = 0.5
      if (/light|photophore|lure bulb|opalescent eye|glint/.test(name)) {
        material.color.set('#8bece0'); material.emissive.set('#34e4d3')
        material.emissiveIntensity = /eye|bulb/.test(name) ? 1.7 : 0.9
      } else if (!/needle/.test(name)) material.color.lerp(new Color('#294b50'), 0.35)
      materials.set(original, material)
    }
    object.material = materials.get(original)
  })
  function joint(name, anchor, names, parent = body, lift = 0) {
    const pivot = new Group(); pivot.name = name
    const point = parts.get(anchor)?.getWorldPosition(new Vector3()) || new Vector3()
    point.y += lift
    parent.add(pivot); parent.updateWorldMatrix(true, false)
    pivot.position.copy(parent.worldToLocal(point)); pivot.updateWorldMatrix(true, false)
    names.forEach(name => { if (parts.has(name)) pivot.attach(parts.get(name)) })
    return pivot
  }
  const legs = [], arms = []
  // Suspend the torso at the hips, so its lean doesn't roll the feet sideways.
  const upper = joint('hanging_torso', 'gaunt torso', [...parts.keys()].filter(name => !/hip socket|thigh|knee|shin|tarsus|foot claw|rear spur/.test(name)), body, -0.3)
  for (const side of ['l', 'r']) {
    const suffix = name => new RegExp(` ${side}(?:[0-9]| |$)`).test(name)
    const legNames = [...parts.keys()].filter(name => suffix(name) && /thigh|knee|shin|tarsus|foot claw|rear spur/.test(name))
    const hip = joint(`hip_${side}`, `thigh ${side}`, legNames, body, 0.26)
    const knee = joint(`knee_${side}`, `knee ${side}`, legNames.filter(name => !/thigh|^knee/.test(name)), hip)
    legs.push({ hip, knee })
    const armNames = [...parts.keys()].filter(name => suffix(name) && /shoulder|elbow|forearm|palm|finger|talon|wrist/.test(name))
    const shoulder = joint(`shoulder_${side}`, `shoulder ${side}`, armNames, upper, 0.07)
    const elbow = joint(`elbow_${side}`, `elbow ${side}`, armNames.filter(name => !/shoulder|^elbow/.test(name)), shoulder)
    arms.push({ shoulder, elbow })
  }
  const head = joint('head', 'sloping neck', [...parts.keys()].filter(name => /cranium|cheek|eye|gum|jaw|needle|maw|antenna|lure/.test(name)), upper)
  const lure = joint('lure', 'angler antenna', ['angler antenna', 'luminous lure bulb'], head)
  const jaw = joint('jaw', 'lower jaw rim l', [...parts.keys()].filter(name => /lower jaw|lower needle/.test(name)), head, 0.06)
  let time = 0, blend = 0
  return {
    group: root, joints: { legs, arms, head, lure, upper, jaw },
    update(delta, moving, chasing, attacking = false) {
      time += delta * (chasing ? 8 : 5)
      blend += ((moving ? 1 : 0) - blend) * (1 - Math.exp(-delta * 8))
      legs.forEach(({ hip, knee }, index) => {
        const phase = time + index * Math.PI
        hip.rotation.x = Math.sin(phase) * (chasing ? 0.32 : 0.23) * blend
        knee.rotation.x = Math.max(0, -Math.sin(phase)) * 0.32 * blend
      })
      arms.forEach(({ shoulder, elbow }, index) => {
        const phase = time + index * Math.PI
        shoulder.rotation.x = -Math.sin(phase) * 0.22 * blend - (attacking ? 0.65 : 0)
        shoulder.rotation.z = (index ? -1 : 1) * (0.025 + (attacking ? 0.16 : 0)) - Math.sin(time * 0.5 - 0.5) * 0.055 * blend
        elbow.rotation.x = 0.06 + Math.cos(phase) * 0.09 * blend
      })
      body.position.y = 0.035 * Math.abs(Math.sin(time)) * blend + Math.sin(time * 0.35) * 0.008
      body.rotation.z = Math.sin(time) * 0.012 * blend
      upper.rotation.z = Math.sin(time * 0.5) * (chasing ? 0.085 : 0.12) * blend
      upper.rotation.y = Math.sin(time * 0.5 - 0.4) * 0.035 * blend
      body.rotation.x = attacking ? 0.12 : chasing ? 0.06 : 0
      head.rotation.y = Math.sin(time * 0.4) * 0.07
      head.rotation.z = -Math.sin(time * 0.5 - 0.35) * 0.06 * blend
      head.rotation.x = Math.sin(time * 0.6) * 0.025 - (attacking ? 0.12 : 0)
      lure.rotation.z = Math.sin(time * 0.5 - 0.8) * (0.1 + 0.08 * blend)
      jaw.rotation.x = 0.035 + (Math.sin(time * 0.65) + 1) * (chasing ? 0.055 : 0.025) + (attacking ? 0.15 : 0)
    },
    dispose() { materials.forEach(material => material.dispose()) },
  }
}
