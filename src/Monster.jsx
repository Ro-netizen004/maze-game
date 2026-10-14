import { lazy, Suspense, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { cellPosition } from './levels'
import { movePlayer } from './collision'
import { findPath, worldCell } from './navigation'
import { Vector3 } from 'three'
import { flashlightHitsGuardian, guardianCanCatch } from './flashlightDetection.js'
import {
  createGuardianState,
  readPlayerNoise,
  guardianSpeed,
  resolveGuardianDifficulty,
  updateGuardianState,
} from './guardianAI'
import DeepSeaMonster from './DeepSeaMonster'
import MonsterAssetBoundary from './MonsterAssetBoundary'

const AnimatedMonster = lazy(() => import('./AnimatedMonster'))

export default function Monster({
  level,
  openedDoors,
  active,
  hidden = false,
  flashlightOn = false,
  playerNoise = null,
  difficulty = 'normal',
  guardianConfig = {},
  paused = false,
  catchDuration = 0.85,
  onCatchStart = () => {},
  onAlertChange = () => {},
  onExposureChange = () => {},
  onCaught,
}) {
  const body = useRef(null)
  const beamDirection=useRef(new Vector3())
  const { camera, gl } = useThree()
  const config = useMemo(
    () => resolveGuardianDifficulty(difficulty, guardianConfig),
    [difficulty, guardianConfig],
  )
  const ai = useRef({
    timer: 0,
    waypoint: null,
    patrol: 1,
    chasing: false,
    moving: false,
    attacking: false,
    caught: false,
    caughtRemaining: 0,
    caughtFinished: false,
    alertMode: null,
    guardian: createGuardianState(),
    routeMode: 'patrol',
    routeDoors: '',
    shelterRevealed: false,
  })
  const [spawnX, spawnZ] = cellPosition(level, level.monster[0])
  useFrame((_, delta) => {
    const monster = body.current
    const state = ai.current
    const dt = Math.min(delta, 0.05)
    if (state.caught) {
      state.attacking = true
      state.moving = false
      state.caughtRemaining -= dt
      if (state.caughtRemaining <= 0 && !state.caughtFinished) {
        state.caughtFinished = true
        onCaught()
      }
      return
    }
    if (!active || paused) { state.moving = false; return }
    state.moving = false
    const distance = Math.hypot(monster.position.x - camera.position.x, monster.position.z - camera.position.z)
    const sameCell = worldCell(level, monster.position.x, monster.position.z).join(',') === worldCell(level, camera.position.x, camera.position.z).join(',')
    state.attacking = distance < 1.4 && sameCell
    const facing = [Math.sin(monster.rotation.y), Math.cos(monster.rotation.y)]
    camera.getWorldDirection(beamDirection.current)
    const exposed=flashlightHitsGuardian({level,openedDoors,
      playerPosition:[camera.position.x,camera.position.y,camera.position.z],
      playerDirection:beamDirection.current.toArray(),guardianPosition:[monster.position.x,monster.position.z],
      flashlightOn,range:config.flashlightRange||14})
    const targetReached = Boolean(
      state.guardian.targetPosition
      && Math.hypot(
        monster.position.x - state.guardian.targetPosition[0],
        monster.position.z - state.guardian.targetPosition[1],
      ) < 0.35
    )
    state.guardian = updateGuardianState(state.guardian, {
      dt,
      level,
      openedDoors,
      guardianPosition: [monster.position.x, monster.position.z],
      guardianFacing: facing,
      playerPosition: [camera.position.x, camera.position.z],
      playerHidden: hidden,
      flashlightExposure: exposed,
      noise: readPlayerNoise(playerNoise),
      targetReached,
      config,
    })
    const revealed=hidden && state.guardian.exposedRemaining>0 && state.guardian.revealedShelterPosition
      && Math.hypot(camera.position.x-state.guardian.revealedShelterPosition[0],camera.position.z-state.guardian.revealedShelterPosition[1])<1
    if(state.shelterRevealed!==Boolean(revealed)) {
      state.shelterRevealed=Boolean(revealed)
      onExposureChange(Boolean(revealed))
    }
    if (state.alertMode !== state.guardian.mode) {
      state.alertMode = state.guardian.mode
      onAlertChange(state.guardian.mode)
    }
    state.chasing = state.guardian.mode === 'chase'
    const doorSignature = openedDoors.join(',')
    if (state.routeMode !== state.guardian.mode || state.routeDoors !== doorSignature) {
      state.waypoint = null
      state.routeMode = state.guardian.mode
      state.routeDoors = doorSignature
    }
    state.timer -= dt
    // Finish each grid segment before planning the next; mid-segment replans cut corners.
    if (!state.waypoint) {
      state.timer = state.chasing ? 0.12 : 0.35
      const start = worldCell(level, monster.position.x, monster.position.z)
      const target = state.guardian.mode === 'patrol'
        ? cellPosition(level, level.monster[state.patrol])
        : state.guardian.targetPosition
      const goal = target ? worldCell(level, target[0], target[1]) : null
      const path = goal ? findPath(level, start, goal, openedDoors) : []
      state.waypoint = path.length > 1 ? cellPosition(level, path[1]) : path.length === 1 ? target : null
      if (state.guardian.mode === 'patrol' && path.length <= 1) {
        state.patrol = 1 - state.patrol
        state.waypoint = null
      }
    }
    const target = state.waypoint
    if (target) {
      const dx = target[0] - monster.position.x
      const dz = target[1] - monster.position.z
      const remaining = Math.hypot(dx, dz)
      if (remaining < 0.07) {
        state.waypoint = null
        state.timer = 0
      }
      else {
        const step = Math.min(remaining, dt * guardianSpeed(state.guardian, config))
        const [x, z] = movePlayer(level, monster.position.x, monster.position.z, dx / remaining * step, dz / remaining * step, openedDoors, 0.75)
        state.moving = Math.hypot(x - monster.position.x, z - monster.position.z) > 0.001
        monster.position.set(x, 0, z)
        const targetAngle = Math.atan2(dx, dz)
        const turn = Math.atan2(Math.sin(targetAngle - monster.rotation.y), Math.cos(targetAngle - monster.rotation.y))
        monster.rotation.y += turn * (1 - Math.exp(-dt * 8))
      }
    }
    if (guardianCanCatch({distance,sameCell,hidden,flashlightExposure:exposed,
      exposedRemaining:state.guardian.exposedRemaining,revealedShelterPosition:state.guardian.revealedShelterPosition,
      playerPosition:[camera.position.x,camera.position.z]})) {
      state.caught = true
      state.caughtRemaining = catchDuration
      state.attacking = true
      state.moving = false
      onCatchStart()
      gl.domElement.ownerDocument.exitPointerLock()
    }
  })
  return (
    <group ref={body} position={[spawnX, 0, spawnZ]} rotation={[0, Math.PI, 0]}>
      <MonsterAssetBoundary fallback={<DeepSeaMonster ai={ai} active={active && !paused} />}>
        <Suspense fallback={<DeepSeaMonster ai={ai} active={active && !paused} />}>
          <AnimatedMonster ai={ai} active={active && !paused} />
        </Suspense>
      </MonsterAssetBoundary>
    </group>
  )
}
