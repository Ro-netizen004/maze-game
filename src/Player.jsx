import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { Euler, Vector3 } from 'three'
import { cellSize, cellPosition, doorPosition, canOpenDoor } from './levels'
import { movePlayer } from './collision'
import { readInput } from './input'
import { worldCell } from './navigation'
import { canActivateShrine, shrineRequirement } from './objectives.js'
import { visibleOfferings } from './objectives.js'
import PlayerAvatar from './PlayerAvatar'

const eyeHeight = 1.6
const speed = 4
const interactionDistance = 1.45


export default function Player({
  level, onWin, collectedKeys, openedDoors, activatedShrines = [], touchInput = {},
  collectedOfferings = [], onCollectOffering = () => {},
  active = true,
  mobile = false,
  reducedMotion = false,
  lookSensitivity = 1,
  invertY = false,
  onPointerUnlock = () => {},
  onCollectKey, onOpenDoor, onNearbyKey = () => {}, onPromptChange = () => {}, onStaminaChange = () => {},
  onHiddenChange = () => {}, onTriggerTrap = () => {}, onActivateShrine = () => {}, onNoise = () => {},
}) {
  const { camera, gl } = useThree()
  const state = useRef({
    keys: new Set(), jump: false, interact: false, velocityY: 0, grounded: true,
    stamina: 100, hiddenIn: null, triggeredTraps: new Set(), trapSlow: 0, noiseTimer: 0,
    touchInteractHeld: false, reportedStamina: 100, sprinting: false,
  })
  const nearbyRef = useRef(null)
  const promptRef = useRef(null)
  const controlsRef = useRef(null)
  const cameraRef = useRef(camera)
  const forward = useRef(new Vector3())
  const right = useRef(new Vector3())
  const lookRotation = useRef(new Euler(0, 0, 0, 'YXZ'))
  const consumedLook = useRef({ x: 0, y: 0 })
  const activeRef = useRef(active)
  const pose = useRef({ x: 0, y: 0, z: 0, yaw: 0, moving: false, sprinting: false })

  useEffect(() => {
    const [x, z] = cellPosition(level, level.start)
    camera.position.set(x, eyeHeight, z)
    camera.lookAt(x, eyeHeight, z + cellSize)
    const controls = new PointerLockControls(camera, gl.domElement)
    controls.enabled = activeRef.current
    controls.pointerSpeed = lookSensitivity
    controlsRef.current = controls
    const canvas = gl.domElement
    const player = state.current
    player.velocityY = 0
    player.grounded = true
    const clearKeys = () => {
      player.keys.clear()
      player.jump = false
      player.interact = false
      player.touchInteractHeld = false
    }
    let dragging = false
    const lock = () => {
      if (!mobile && activeRef.current && !controls.isLocked) {
        try { canvas.requestPointerLock?.()?.catch(() => {}) } catch { /* Drag-to-look remains available. */ }
      }
    }
    const pointerDown = () => { dragging = activeRef.current }
    const pointerUp = () => { dragging = false }
    const mouseMove = event => {
      if (mobile || !activeRef.current || controls.isLocked || !dragging) return
      const rotation = lookRotation.current.setFromQuaternion(camera.quaternion, 'YXZ')
      rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x - event.movementY * 0.002 * lookSensitivity * (invertY ? -1 : 1)))
      rotation.y -= event.movementX * 0.002 * lookSensitivity
      camera.quaternion.setFromEuler(rotation)
    }
    const keyDown = (event) => {
      if (!activeRef.current || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(event.target?.tagName)) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'KeyE', 'ShiftLeft', 'ShiftRight'].includes(event.code)) event.preventDefault()
      player.keys.add(event.code)
      if (event.code === 'Space' && !event.repeat) player.jump = true
      if (event.code === 'KeyE' && !event.repeat) player.interact = true
    }
    const keyUp = (event) => player.keys.delete(event.code)
    canvas.addEventListener('click', lock)
    canvas.addEventListener('pointerdown', pointerDown)
    window.addEventListener('pointerup', pointerUp)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    window.addEventListener('blur', clearKeys)
    const unlock = () => {
      clearKeys()
      onPointerUnlock()
    }
    controls.addEventListener('unlock', unlock)

    return () => {
      canvas.removeEventListener('click', lock)
      canvas.removeEventListener('pointerdown', pointerDown)
      window.removeEventListener('pointerup', pointerUp)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', clearKeys)
      controls.removeEventListener('unlock', unlock)
      if (controls.isLocked) controls.unlock()
      controls.dispose()
      controlsRef.current = null
      clearKeys()
    }
  }, [camera, gl, level, lookSensitivity, invertY, mobile, onPointerUnlock])

  useEffect(() => {
    activeRef.current = active
    if (controlsRef.current) controlsRef.current.enabled = active
    if (!active) {
      state.current.keys.clear()
      state.current.jump = false
      state.current.interact = false
      state.current.sprinting = false
    }
  }, [active])

  useEffect(() => () => {
    cameraRef.current.fov = 75
    cameraRef.current.updateProjectionMatrix()
  }, [])

  useFrame((_, delta) => {
    const viewCamera = cameraRef.current
    const fovTarget = active && state.current.sprinting && !reducedMotion ? 79 : 75
    const nextFov = reducedMotion ? fovTarget : viewCamera.fov + (fovTarget - viewCamera.fov) * (1 - Math.exp(-Math.min(delta, 0.1) * 7))
    if (Math.abs(nextFov - viewCamera.fov) > 0.001) {
      viewCamera.fov = nextFov
      viewCamera.updateProjectionMatrix()
    }
    if (!active) return
    if (!controlsRef.current) {
      state.current.sprinting = false
      if (nearbyRef.current !== null) {
        nearbyRef.current = null
        onNearbyKey(null)
      }
      if (promptRef.current !== null) {
        promptRef.current = null
        onPromptChange(null)
      }
      return
    }
    // Cap long frames and use small steps to avoid passing through walls.
    const elapsed = Math.min(delta, 0.1)
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 120)))
    const dt = elapsed / steps
    const player = state.current
    const touch = touchInput.current || touchInput
    const input = readInput(player.keys, touch)
    if (mobile) {
      const lookX = touch.lookX || 0
      const lookY = touch.lookY || 0
      const dx = lookX - consumedLook.current.x
      const dy = lookY - consumedLook.current.y
      consumedLook.current = { x: lookX, y: lookY }
      const rotation = lookRotation.current.setFromQuaternion(camera.quaternion, 'YXZ')
      rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x - dy * 0.0022 * lookSensitivity * (invertY ? -1 : 1)))
      rotation.y -= dx * 0.0022 * lookSensitivity
      camera.quaternion.setFromEuler(rotation)
    }
    if (input.jump) player.jump = true
    if (input.interact && !player.touchInteractHeld && !player.keys.has('KeyE')) player.interact = true
    player.touchInteractHeld = input.interact
    const vertical = input.forward
    const horizontal = input.right
    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    right.current.set(-forward.current.z, 0, forward.current.x)
    const length = Math.hypot(vertical, horizontal) || 1
    const moving = Math.hypot(vertical, horizontal) > 0 && !player.hiddenIn
    const sprinting = input.sprint && moving && player.stamina > 0 && !player.hiddenIn
    player.sprinting = sprinting
    const drain = level.mechanics.sprintDrain
    const regen = level.mechanics.staminaRegen
    player.stamina = Math.max(0, Math.min(100, player.stamina + (sprinting ? -drain : regen) * elapsed))
    const roundedStamina = Math.round(player.stamina)
    if (roundedStamina !== player.reportedStamina) {
      player.reportedStamina = roundedStamina
      onStaminaChange(roundedStamina)
    }
    player.trapSlow = Math.max(0, player.trapSlow - elapsed)
    const moveSpeed = speed * (sprinting ? 1.55 : 1) * (player.trapSlow > 0 ? 0.45 : 1)
    const dx = player.hiddenIn ? 0 : (forward.current.x * vertical + right.current.x * horizontal) / length * moveSpeed
    const dz = player.hiddenIn ? 0 : (forward.current.z * vertical + right.current.z * horizontal) / length * moveSpeed

    if (player.jump && player.grounded && !player.hiddenIn) {
      player.velocityY = 5
      player.grounded = false
    }
    player.jump = false

    for (let i = 0; i < steps; i++) {
      const [nextX, nextZ] = movePlayer(level, camera.position.x, camera.position.z, dx * dt, dz * dt, openedDoors)
      camera.position.set(nextX, camera.position.y, nextZ)

      player.velocityY -= 14 * dt
      camera.position.setY(camera.position.y + player.velocityY * dt)
      if (camera.position.y <= eyeHeight) {
        camera.position.setY(eyeHeight)
        player.velocityY = 0
        player.grounded = true
      }
    }
    pose.current.x = camera.position.x
    pose.current.y = camera.position.y - eyeHeight
    pose.current.z = camera.position.z
    pose.current.yaw = Math.atan2(forward.current.x, forward.current.z)
    pose.current.moving = moving && !player.hiddenIn
    pose.current.sprinting = sprinting
    const [endX, endZ] = cellPosition(level, level.end)
    let nearby = null
    let interaction = null
    for (const key of player.hiddenIn ? [] : level.keys) {
      const [keyX, keyZ] = cellPosition(level, key.cell)
      if (!collectedKeys.includes(key.id) && Math.hypot(camera.position.x - keyX, camera.position.z - keyZ) < interactionDistance) {
        nearby = key.id
        interaction = { type: 'key', id: key.id, label: `Pick up ${key.name} key` }
        break
      }
    }
    if (!interaction && !player.hiddenIn) {
      for (const offering of visibleOfferings(level, openedDoors, activatedShrines, collectedOfferings)) {
        const [x,z] = cellPosition(level, offering.cell)
        if (collectedOfferings.includes(offering.id) || Math.hypot(camera.position.x-x,camera.position.z-z) >= interactionDistance) continue
        const available = true
        interaction = { type: 'offering', id: offering.id, available, label: available ? 'Collect '+offering.name : offering.rune==='watch' ? 'Watcher’s Eye needs Dawn and Moon lit' : offering.name+' needs the '+offering.requiresDoors.join(' and ')+' seal opened' }
        break
      }
    }
    if (!interaction && !player.hiddenIn) {
      for (const door of level.doors) {
        const [doorX, doorZ] = doorPosition(level, door)
        if (openedDoors.includes(door.id) || Math.hypot(camera.position.x - doorX, camera.position.z - doorZ) >= interactionDistance) continue
        const available = canOpenDoor(level, door, collectedKeys, openedDoors, activatedShrines)
        interaction = { type: 'door', id: door.id, available, label: available ? `Open ${door.name} door` : door.id==='exit' ? 'Exit needs both inner seals and all three runes' : `${door.name} door is locked` }
        break
      }
    }
    if (!interaction && !player.hiddenIn) {
      for (const shrine of level.shrines) {
        const [x, z] = cellPosition(level, shrine.cell)
        if (!activatedShrines.includes(shrine.id) && Math.hypot(camera.position.x - x, camera.position.z - z) < (shrine.type==='rune'?3:interactionDistance)) {
          const available=canActivateShrine(shrine,openedDoors,activatedShrines,collectedOfferings)
          interaction = { type: 'shrine', id: shrine.id, available, label: available ? shrine.type==='rune'?`Offer both relics · ${shrine.placeName}`:'Activate shrine' : shrineRequirement(level,shrine,openedDoors,activatedShrines,collectedOfferings) }
          break
        }
      }
    }
    if (!interaction) {
      for (const spot of level.hidingSpots) {
        const [x, z] = cellPosition(level, spot.cell)
        if ((player.hiddenIn === spot.id || Math.hypot(camera.position.x - x, camera.position.z - z) < interactionDistance)) {
          interaction = { type: 'hiding', id: spot.id, label: player.hiddenIn ? 'Leave hiding spot' : spot.type === 'shrub' ? 'Hide in the hedge' : 'Hide' }
          break
        }
      }
    }
    if (interaction && player.interact) {
      if (interaction.type === 'key') { onCollectKey(interaction.id); nearby = null }
      if (interaction.type === 'offering' && interaction.available) onCollectOffering(interaction.id)
      if (interaction.type === 'door' && interaction.available) {
        onOpenDoor(interaction.id)
        onNoise({ cell: worldCell(level, camera.position.x, camera.position.z), intensity: 6, source: 'door' })
      }
      if (interaction.type === 'shrine' && interaction.available) onActivateShrine(interaction.id)
      if (interaction.type === 'hiding') {
        const spot=level.hidingSpots.find(item=>item.id===interaction.id)
        if(spot.type==='shrub') {
          const [x,z]=cellPosition(level,player.hiddenIn ? spot.entryCell : spot.cell)
          camera.position.set(x,eyeHeight,z)
          player.velocityY=0
        }
        player.hiddenIn = player.hiddenIn ? null : interaction.id
        onHiddenChange(Boolean(player.hiddenIn))
      }
    }
    player.interact = false
    if (nearbyRef.current !== nearby) {
      nearbyRef.current = nearby
      onNearbyKey(nearby)
    }
    const promptKey = interaction ? `${interaction.type}:${interaction.id}:${interaction.label}` : null
    if (promptRef.current !== promptKey) {
      promptRef.current = promptKey
      onPromptChange(interaction)
    }
    const currentCell = worldCell(level, camera.position.x, camera.position.z)
    for (const trap of level.traps) {
      if (trap.cell.join(',') === currentCell.join(',') && !player.triggeredTraps.has(trap.id)) {
        player.triggeredTraps.add(trap.id)
        player.trapSlow = level.mechanics.trapSlowSeconds || 1
        onTriggerTrap(trap.id)
        onNoise({ cell: currentCell, intensity: 7, source: 'trap' })
      }
    }
    player.noiseTimer -= elapsed
    const noisyZone = level.noisyZones.find(zone => zone.cell.join(',') === currentCell.join(','))
    if (moving && player.noiseTimer <= 0) {
      player.noiseTimer = 0.3
      onNoise({ cell: currentCell, intensity: (sprinting ? 5 : 2) * (noisyZone ? level.mechanics.noisyFloorMultiplier : 1), source: noisyZone ? 'noisy-floor' : sprinting ? 'sprint' : 'step' })
    }
    if (openedDoors.includes('exit') && Math.abs(camera.position.x - endX) < 0.75 && Math.abs(camera.position.z - endZ) < 0.75) {
      controlsRef.current.unlock()
      onWin()
    }
  })

  return <PlayerAvatar pose={pose} local />
}
