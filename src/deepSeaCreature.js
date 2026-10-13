import { Group, Mesh, MeshStandardMaterial, MeshBasicMaterial, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, Vector3 } from 'three'

export const creatureScale = 0.34

export function createDeepSeaCreature() {
  const group = new Group()
  group.scale.setScalar(creatureScale)
  const geometries = {
    sphere: new SphereGeometry(1, 10, 8),
    joint: new SphereGeometry(1, 6, 4),
    limb: new CylinderGeometry(1, 1, 1, 5),
    tooth: new ConeGeometry(1, 1, 5),
    mouth: new TorusGeometry(0.54, 0.075, 6, 16),
  }
  const materials = {
    body: new MeshStandardMaterial({ color: '#0b2027', roughness: 0.8 }),
    joint: new MeshStandardMaterial({ color: '#29464e', roughness: 0.7 }),
    mouth: new MeshStandardMaterial({ color: '#020305', roughness: 1 }),
    ivory: new MeshStandardMaterial({ color: '#e3dbbd', roughness: 0.65 }),
    glow: new MeshBasicMaterial({ color: '#88f4ff', toneMapped: false }),
  }
  function mesh(shape, material, position, scale) {
    const object = new Mesh(geometries[shape], materials[material])
    object.position.set(...position)
    object.scale.set(...scale)
    object.castShadow = material !== 'glow'
    object.receiveShadow = material !== 'glow'
    group.add(object)
    return object
  }
  const abdomen = mesh('sphere', 'body', [0, 3.9, -0.3], [0.47, 1.5, 0.55])
  abdomen.rotation.x = -0.18
  const thorax = mesh('sphere', 'body', [0, 5.05, 0.12], [0.4, 1.1, 0.42])
  thorax.rotation.x = 0.25
  const headStart = group.children.length
  mesh('sphere', 'body', [0, 5.95, 0.42], [0.7, 0.68, 0.6])
  mesh('sphere', 'mouth', [0, 5.8, 0.95], [0.55, 0.48, 0.18])
  mesh('mouth', 'joint', [0, 5.8, 1.02], [1, 0.92, 1])
  for (const side of [-1, 1]) mesh('sphere', 'glow', [side * 0.37, 6.3, 0.9], [0.14, 0.2, 0.09])
  const lowerTeeth = []
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.19
    const length = i % 2 ? 0.42 : 0.55
    const upper = mesh('tooth', 'ivory', [x, 6.12 - length / 2, 1.13], [0.055, length, 0.055])
    upper.rotation.z = Math.PI
    lowerTeeth.push(mesh('tooth', 'ivory', [x, 5.45 + length * 0.36, 1.13], [0.045, length * 0.72, 0.045]))
  }
  const head = new Group()
  head.position.set(0, 5.95, 0.42)
  const faceParts = group.children.slice(headStart)
  for (const part of faceParts) {
    part.position.sub(head.position)
    head.add(part)
  }
  group.add(head)
  const toothHeights = lowerTeeth.map(tooth => tooth.position.y)
  const torso = new Group()
  torso.position.set(0, 4.4, 0)
  for (const part of [abdomen, thorax]) { part.position.sub(torso.position); torso.add(part) }
  for (let i = 0; i < 6; i++) {
    const spot = mesh('sphere', 'glow', [(i % 2 ? 1 : -1) * 0.22, 3.4 + i * 0.38, -0.73], [0.075, 0.09, 0.07])
    spot.position.sub(torso.position)
    torso.add(spot)
  }
  group.add(torso)

  const axis = new Vector3(0, 1, 0)
  const vector = new Vector3()
  function segment(object, from, to, thickness) {
    vector.subVectors(to, from)
    object.position.copy(from).add(to).multiplyScalar(0.5)
    object.scale.set(thickness, vector.length(), thickness)
    object.quaternion.setFromUnitVectors(axis, vector.normalize())
  }
  const antennaPoints = [[0, 6.4, 0.25], [0, 6.9, 0.4], [0.1, 7.25, 0.65], [0.15, 7.35, 0.95], [0.15, 7.15, 1.2], [0.1, 6.85, 1.35], [0.05, 6.55, 1.4]].map(point => new Vector3(...point))
  const antennaBase = antennaPoints.map(point => point.clone())
  const antenna = []
  for (let i = 1; i < antennaPoints.length; i++) {
    const stalk = mesh('limb', 'joint', [0, 0, 0], [1, 1, 1])
    segment(stalk, antennaPoints[i - 1], antennaPoints[i], 0.035)
    antenna.push(stalk)
  }
  const lure = mesh('sphere', 'glow', antennaPoints.at(-1).toArray(), [0.11, 0.16, 0.11])

  const arms = [-1, 1].map(side => ({
    side, shoulder: new Vector3(side * 0.45, 5.1, 0.25), elbow: new Vector3(), wrist: new Vector3(),
    upper: mesh('limb', 'body', [0, 0, 0], [1, 1, 1]),
    lower: mesh('limb', 'body', [0, 0, 0], [1, 1, 1]),
    joint: mesh('joint', 'joint', [0, 0, 0], [0.14, 0.18, 0.14]),
    palm: mesh('sphere', 'body', [0, 0, 0], [0.18, 0.3, 0.12]),
    fingers: Array.from({ length: 3 }, () => ({
      bend: new Vector3(), tip: new Vector3(),
      upper: mesh('limb', 'body', [0, 0, 0], [1, 1, 1]),
      lower: mesh('limb', 'joint', [0, 0, 0], [1, 1, 1]),
    })),
  }))

  const legs = []
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      legs.push({
        side, index: i,
        hip: new Vector3(side * 0.3, 4.6 - i * 0.27, (i - 1.5) * 0.4),
        knee: new Vector3(), foot: new Vector3(),
        upper: mesh('limb', 'body', [0, 0, 0], [1, 1, 1]),
        lower: mesh('limb', 'body', [0, 0, 0], [1, 1, 1]),
        joint: mesh('joint', 'joint', [0, 0, 0], [0.12, 0.12, 0.12]),
        tip: mesh('tooth', 'joint', [0, 0, 0], [0.07, 0.28, 0.07]),
      })
    }
  }
  let phase = 0
  let time = 0
  let walkBlend = 0
  function update(delta, moving, chasing, attacking = false) {
    time += delta
    walkBlend += ((moving ? 1 : 0) - walkBlend) * (1 - Math.exp(-delta * 8))
    phase += delta * (chasing ? 9 : 5.5)
    const breath = Math.sin(time * 1.7)
    const bob = Math.sin(phase * 2) * 0.12 * walkBlend + breath * 0.04
    torso.position.y = 4.4 + bob
    torso.rotation.x = -0.1 + breath * 0.025
    torso.scale.x = 1 + breath * 0.018
    head.position.y = 5.88 + bob
    const attackPulse = attacking ? 0.5 + Math.sin(time * 18) * 0.12 : 0
    head.rotation.x = -0.1 + Math.sin(time * 1.2) * 0.06 + (chasing ? 0.1 : 0) + attackPulse
    head.rotation.y = Math.sin(time * 0.7) * (chasing ? 0.025 : 0.12)
    for (let i = 0; i < lowerTeeth.length; i++) lowerTeeth[i].position.y = toothHeights[i] - (breath + 1) * 0.025
    for (let i = 0; i < antennaPoints.length; i++) {
      antennaPoints[i].copy(antennaBase[i])
      antennaPoints[i].x += Math.sin(time * 1.8 + i * 0.2) * i * 0.022
      antennaPoints[i].y += bob
      if (i) segment(antenna[i - 1], antennaPoints[i - 1], antennaPoints[i], 0.035)
    }
    lure.position.copy(antennaPoints.at(-1))
    lure.scale.setScalar(0.12 + Math.sin(time * 2) * 0.015)
    for (const arm of arms) {
      const swing = Math.sin(phase + (arm.side > 0 ? Math.PI : 0)) * walkBlend
      arm.elbow.set(arm.side * 0.9, 3.4 + bob, 0.6 + swing * 0.25)
      arm.wrist.set(
        arm.side * (attacking ? 0.55 : 1.1),
        (attacking ? 4.25 : 2.1) + bob + swing * 0.1,
        (attacking ? 2.15 : 0.95) + swing * 0.3,
      )
      segment(arm.upper, arm.shoulder, arm.elbow, 0.13)
      segment(arm.lower, arm.elbow, arm.wrist, 0.09)
      arm.joint.position.copy(arm.elbow)
      arm.palm.position.copy(arm.wrist)
      for (let i = 0; i < arm.fingers.length; i++) {
        const finger = arm.fingers[i]
        const spread = (i - 1) * 0.18
        finger.bend.set(arm.wrist.x + spread, arm.wrist.y - 0.5, arm.wrist.z + 0.15)
        finger.tip.set(arm.wrist.x + spread * 1.4, arm.wrist.y - 0.9 + i * 0.07, arm.wrist.z + 0.42 + Math.sin(time * 1.4 + i) * 0.07)
        segment(finger.upper, arm.wrist, finger.bend, 0.045)
        segment(finger.lower, finger.bend, finger.tip, 0.025)
      }
    }
    for (const leg of legs) {
      const gait = phase + leg.index * Math.PI / 2 + (leg.side > 0 ? Math.PI : 0)
      const stride = Math.sin(gait) * walkBlend
      leg.knee.set(leg.side * (1.3 + stride * 0.08), 2.8 + stride * 0.25 + breath * 0.06, (leg.index - 1.5) * 0.55 + stride * 0.18)
      leg.foot.set(leg.side * (1.68 + Math.cos(gait) * 0.06 * walkBlend), 0.08 + Math.max(0, Math.sin(gait)) * 0.75 * walkBlend, (leg.index - 1.5) * 0.48 + stride * 0.45)
      segment(leg.upper, leg.hip, leg.knee, 0.07)
      segment(leg.lower, leg.knee, leg.foot, 0.075)
      leg.joint.position.copy(leg.knee)
      leg.tip.position.copy(leg.foot)
      leg.tip.position.y += 0.1
      leg.tip.rotation.z = Math.PI
    }
  }
  update(0, false, false)
  return { group, update, dispose() {
    Object.values(geometries).forEach(geometry => geometry.dispose())
    Object.values(materials).forEach(material => material.dispose())
  } }
}
