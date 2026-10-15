import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ForestAmbience from './ForestAmbience.jsx'
import GuardianAudio from './GuardianAudio.jsx'
import { graphicsPreset } from './graphics.js'
import useMultiplayer from './multiplayer/useMultiplayer.js'
import MultiplayerWorld from './multiplayer/MultiplayerWorld.jsx'
import CoopHud from './multiplayer/CoopHud.jsx'
import useQuestProgress from './quest/useQuestProgress.js'
import ForestMaze from './ForestMaze'
import Player from './Player'
import { levelTemplates } from './levels'
import { createSeededLevel } from './levelRuntime'
import QuestObjects from './QuestObjects'
import Monster from './Monster'
import ForestExit from './ForestExit'
import Flashlight from './Flashlight'
import OfferingObjects from './quest/OfferingObjects.jsx'
import MechanicObjects from './MechanicObjects'
import EnvironmentalDust from './EnvironmentalDust'
import MazeAtmosphere from './MazeAtmosphere'
import GameHud from './components/GameHud'
import StartResultOverlay from './components/StartResultOverlay'
import PauseMenu from './components/PauseMenu'
import MobileControls from './components/MobileControls'
import { createDefaultProgress, loadProgress, recordWin, saveProgress } from './persistence'
import { advanceTimer } from './runTimer'
import { updateFlashlightBattery } from './flashlightBattery'
import { createBlackoutState,advanceBlackout,blackoutPower,blackoutRemaining } from './blackout.js'

export default function App({ guardianConfig = {} }) {
  const [progress, setProgress] = useState(loadProgress)
  const [selectedLevel, setLevelIndex] = useState(0)
  const [mode, setMode] = useState('solo')
  const multiplayer = useMultiplayer(resetLocalRuntime)
  const room = mode === 'multiplayer' ? multiplayer.room : null
  const isCoop = Boolean(room)
  const levelIndex = room?.levelIndex ?? selectedLevel
  const [soloStatus, setStatus] = useState('ready')
  const status = room?.phase ?? soloStatus
  const localPlayer = room?.players.find(player => player.id === multiplayer.id)
  const canPlay = !localPlayer?.downed && !localPlayer?.escaped
  const [paused, setPaused] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [triggeredTraps, setTriggeredTraps] = useState([])
  const [prompt, setPrompt] = useState(null)
  const [stamina, setStamina] = useState(100)
  const [hidden, setHidden] = useState(false)
  const [shelterRevealed,setShelterRevealed]=useState(false)
  const [guardianAlert, setGuardianAlert] = useState('patrol')
  const [guardianProximity,setGuardianProximity]=useState(0)
  const [notice, setNotice] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [blackout,setBlackout]=useState(createBlackoutState)
  const [isTouch, setIsTouch] = useState(false)
  const [flashlightBattery, setFlashlightBattery] = useState(100)
  const [flashlightOn, setFlashlightOn] = useState(true)
  const ambienceAudio = useRef(null)
  const guardianAudio=useRef(null)
  const playerNoise = useRef(null)
  const playerPose = useRef(null)
  const touchInput = useRef({ forward: 0, right: 0, jump: false, sprint: false, interact: false, lookX: 0, lookY: 0 })
  const elapsedRef = useRef(0)
  const timerNow = useRef(null)
  const noiseId = useRef(0)
  const difficulty = room?.difficulty ?? progress.difficulty
  const settings = progress.settings
  const level = useMemo(() => createSeededLevel(levelTemplates[levelIndex], room?.seed ?? `${levelTemplates[levelIndex].id}:${attempt}`), [levelIndex, attempt, room?.seed])
  const soloQuest = useQuestProgress(level, setNotice)
  const { collectedKeys, collectedOfferings, openedDoors, activatedShrines } = room?.quest ?? soloQuest
  const { resetQuest } = soloQuest
  const action = (type,id) => multiplayer.send({type:'action',action:{type,id}})
  const collectKey = isCoop ? id=>action('key',id) : soloQuest.collectKey
  const collectOffering = isCoop ? id=>action('offering',id) : soloQuest.collectOffering
  const activateShrine = isCoop ? id=>action('shrine',id) : soloQuest.activateShrine
  const openDoor = isCoop ? id=>action('door',id) : soloQuest.openDoor
  const runElapsed = room?.elapsed ?? elapsed
  const runBlackout = room?.blackout ?? blackout
  const graphics = graphicsPreset(settings.graphicsQuality,isTouch)
  const timerActive = status === 'playing' && !paused

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)')
    const update = () => setIsTouch(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  useEffect(() => {
    saveProgress(progress)
  }, [progress])
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion)
    return () => document.documentElement.classList.remove('reduce-motion')
  }, [settings.reducedMotion])
  useEffect(() => {
    timerNow.current = performance.now()
    if (!timerActive) return
    const tick = () => {
      const now = performance.now()
      const blackoutDelta=(now-timerNow.current)/1000
      elapsedRef.current = advanceTimer(elapsedRef.current, timerNow.current, now, true)
      timerNow.current = now
      setElapsed(elapsedRef.current)
      setBlackout(current=>advanceBlackout(current,elapsedRef.current/1000,blackoutDelta))
    }
    const timer = setInterval(tick, 100)
    return () => {
      tick()
      clearInterval(timer)
    }
  }, [timerActive])
  useEffect(() => {
    const onKeyDown = event => {
      if (event.code === 'KeyF' && !event.repeat && status === 'playing' && !paused) {
        event.preventDefault()
        setFlashlightOn(value => value ? false : flashlightBattery > 0)
      }
      if (event.key === 'Escape' && status === 'playing' && !paused) setPaused(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flashlightBattery, paused, status])
  useEffect(() => {
    if (!timerActive) return
    let previous = performance.now()
    const tick = () => {
      const now = performance.now()
      const elapsedSeconds = Math.min((now - previous) / 1000, 0.25)
      previous = now
      setFlashlightBattery(current => {
        const next = updateFlashlightBattery(current, elapsedSeconds, flashlightOn)
        if (flashlightOn && next <= 0) setFlashlightOn(false)
        return next
      })
    }
    const timer = setInterval(tick, 100)
    return () => clearInterval(timer)
  }, [flashlightOn, timerActive])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(timer)
  }, [notice])
  function restart() {
    if (isCoop) multiplayer.send({type: ['won','lost'].includes(room.phase) && room.ownerId===multiplayer.id ? 'reset' : 'leave'})
    resetLocalRuntime()
  }
  function resetLocalRuntime() {
    resetQuest()
    setNotice(null)
    setTriggeredTraps([])
    setPrompt(null)
    setStamina(100)
    setFlashlightBattery(100)
    setFlashlightOn(true)
    setHidden(false)
    setShelterRevealed(false)
    setGuardianAlert('patrol')
    setGuardianProximity(0)
    playerNoise.current = null
    elapsedRef.current = 0
    setElapsed(0)
    setBlackout(createBlackoutState())
    setPaused(false)
    setAttempt(value => value + 1)
    setStatus('ready')
  }
  function chooseLevel(index) {
    if (isCoop || index > progress.unlockedLevel) return
    setLevelIndex(index)
    restart()
  }
  const handlePointerUnlock = useCallback(() => {
    setStatus(current => {
      if (current === 'playing') setPaused(true)
      return current
    })
  }, [])
  function updateProgress(updater) {
    setProgress(current => typeof updater === 'function' ? updater(current) : updater)
  }
  function handleWin() {
    if (isCoop) { action('escape'); return }
    const now = performance.now()
    const finalTime = advanceTimer(elapsedRef.current, timerNow.current, now, timerActive)
    elapsedRef.current = finalTime
    timerNow.current = now
    setElapsed(finalTime)
    setProgress(current => recordWin(current, level.id, difficulty, finalTime, levelIndex, levelTemplates.length))
    setStatus('won')
    setPaused(false)
  }
  function resume() {
    guardianAudio.current?.unlock()
    setPaused(false)
    captureMouse()
  }
  function captureMouse() {
    const canvas = document.querySelector('canvas')
    document.activeElement?.blur?.()
    if (!isTouch && canvas && document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock?.()?.catch(() => {}) } catch { /* Drag-to-look remains available. */ }
    }
  }
  function startGame() {
    guardianAudio.current?.unlock()
    if(settings.ambienceEnabled) {
      ambienceAudio.current.volume=settings.ambienceVolume/100
      ambienceAudio.current.play().catch(()=>{})
    }
    setPaused(false)
    if (mode==='multiplayer') {
      if (room?.ownerId===multiplayer.id) multiplayer.send({type:'start'})
      return
    }
    setStatus('playing')
    captureMouse()
  }
  function pauseGame() {
    document.exitPointerLock?.()
    setPaused(true)
  }
  function resetProgress() {
    setProgress(createDefaultProgress())
    setLevelIndex(0)
    restart()
  }
  function toggleFlashlight() {
    if (!timerActive) return
    setFlashlightOn(value => value ? false : flashlightBattery > 0)
  }
  return (
    <div className={`relative h-screen w-full ${status === 'catching' ? 'guardian-caught' : ''}`}>
      <ForestAmbience audioRef={ambienceAudio} active={timerActive} enabled={settings.ambienceEnabled} volume={settings.ambienceVolume} />
      <GuardianAudio controllerRef={guardianAudio} active={timerActive} enabled={settings.ambienceEnabled} volume={settings.ambienceVolume} proximity={guardianProximity} />
      <Canvas shadows={graphics.shadows} dpr={graphics.dpr} frameloop={timerActive || status === 'catching' || (isCoop && status==='playing') ? 'always' : 'demand'}
        gl={{ antialias: !isTouch, powerPreference: isTouch ? 'low-power' : 'high-performance' }}
        camera={{ position: [-6, 1.6, -8], fov: 75, near: 0.03 }}>
        <color attach="background" args={[activatedShrines.length ? '#101d29' : '#0b1821']} />
        <fog attach="fog" args={['#203536', 4, 18 + activatedShrines.length * (level.mechanics.shrineVisibilityBoost || 0)]} />
        <hemisphereLight args={['#91afc2', '#26372f', 0.48]} />
        <MazeAtmosphere level={level} mobile={isTouch} shadowSize={graphics.shadowSize} power={blackoutPower(runBlackout)} />
        <EnvironmentalDust mobile={isTouch || settings.graphicsQuality === 'performance'} reducedMotion={settings.reducedMotion} active={timerActive} flashlightOn={flashlightOn && flashlightBattery > 0} />
        <ForestMaze level={level} mobile={isTouch || settings.graphicsQuality === 'performance'} mist={settings.graphicsQuality !== 'performance'} reducedMotion={settings.reducedMotion} />
        <ForestExit level={level} />
        {!isCoop && <Monster
          key={`monster-${levelIndex}-${attempt}`}
          level={level}
          openedDoors={openedDoors}
          active={status === 'playing' || status === 'catching'}
          paused={paused && status !== 'catching'}
          hidden={hidden}
          flashlightOn={flashlightOn && flashlightBattery>0}
          playerNoise={playerNoise}
          difficulty={difficulty}
          mobile={isTouch}
          guardianConfig={guardianConfig}
          onAlertChange={setGuardianAlert}
          onExposureChange={setShelterRevealed}
          onProximityChange={setGuardianProximity}
          onCatchStart={() => setStatus(current => current === 'playing' ? 'catching' : current)}
          onCaught={() => {
            setNotice(null)
            setStatus(current => current === 'catching' ? 'lost' : current)
          }}
        />}
        <QuestObjects level={level} collectedKeys={collectedKeys} openedDoors={openedDoors} />
        <OfferingObjects level={level} collectedOfferings={collectedOfferings} openedDoors={openedDoors} activatedShrines={activatedShrines} active={timerActive} reducedMotion={settings.reducedMotion} />
        <MechanicObjects level={level} triggeredTraps={triggeredTraps} activatedShrines={activatedShrines} />
        {(status === 'ready' || status === 'playing' || status === 'catching') && <Player key={`${levelIndex}-${attempt}-${room?.seed ?? mode}`} level={level} collectedKeys={collectedKeys} openedDoors={openedDoors}
          active={status === 'playing' && !paused && canPlay}
          mobile={isTouch} touchInput={touchInput}
          reducedMotion={settings.reducedMotion}
          lookSensitivity={settings.lookSensitivity} invertY={settings.invertY}
          onPointerUnlock={handlePointerUnlock} onPose={pose=>{playerPose.current=pose}}
          teammates={room?.players ?? []} playerId={multiplayer.id} onRevive={id=>action('revive',id)}
          activatedShrines={activatedShrines} collectedOfferings={collectedOfferings} onCollectOffering={collectOffering} onCollectKey={collectKey}
          onPromptChange={setPrompt} onStaminaChange={setStamina} onHiddenChange={setHidden}
          onNoise={noise => { playerNoise.current = { ...noise, id: ++noiseId.current } }}
          onTriggerTrap={id => setTriggeredTraps(items => items.includes(id) ? items : [...items, id])}
          onActivateShrine={activateShrine}
          onOpenDoor={openDoor}
          onWin={handleWin} />}
        {isCoop && <MultiplayerWorld multiplayer={multiplayer} hidden={hidden} flashlightOn={flashlightOn && flashlightBattery>0} onProximityChange={setGuardianProximity} playerPose={playerPose} paused={paused} />}
        <Flashlight intensity={settings.flashlightIntensity} battery={flashlightBattery} on={flashlightOn}
          mobile={isTouch} reducedMotion={settings.reducedMotion} active={timerActive} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.22) 100%)' }} />
      {(status === 'playing' || status === 'catching') && <GameHud level={level} levelIndex={levelIndex} levelCount={levelTemplates.length}
        collectedOfferings={collectedOfferings} collectedKeys={collectedKeys} openedDoors={openedDoors} stamina={stamina} hidden={isCoop ? Boolean(localPlayer?.hidden) : hidden} shelterRevealed={isCoop ? Boolean(localPlayer?.exposed) : shelterRevealed}
        elapsed={runElapsed} prompt={status === 'playing' && canPlay ? prompt : null} notice={notice} isTouch={isTouch}
        flashlightBattery={flashlightBattery} flashlightOn={flashlightOn} guardianAlert={room?.guardian.mode ?? guardianAlert} multiplayer={isCoop} activatedShrines={activatedShrines} />}
      {status==='playing' && (runBlackout.phase==='flickering' || runBlackout.phase==='dark') && <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 rounded bg-slate-950/90 px-4 py-2 text-sm font-bold text-amber-200" role="status">Lightposts {runBlackout.phase==='flickering'?'flickering':'off'} · {blackoutRemaining(runBlackout)}s · Watch where you aim your flashlight</div>}
      {status === 'playing' && !paused && <button className="absolute right-4 top-24 z-20 rounded-lg border border-white/30 bg-slate-950/80 px-4 py-2 font-semibold text-white" onClick={pauseGame}>Pause</button>}
      {status === 'playing' && !paused && canPlay && isTouch && <MobileControls inputRef={touchInput}
        flashlightOn={flashlightOn} onToggleFlashlight={toggleFlashlight} />}
      {status === 'catching' && <div className="caught-vignette pointer-events-none absolute inset-0" aria-hidden="true" />}
      {isCoop && status==='playing' && <CoopHud multiplayer={multiplayer} onLeave={restart} />}
      {paused && status === 'playing' && <PauseMenu settings={settings} multiplayer={isCoop}
        onSettings={next => updateProgress(current => ({ ...current, settings: next }))}
        onReset={resetProgress} onResume={resume} onMenu={restart} />}
      {status !== 'playing' && status !== 'catching' && <StartResultOverlay status={status} level={level} mode={mode} multiplayer={multiplayer}
        onMode={value=>{if(value===mode)return;multiplayer.disconnect();restart();setMode(value)}}
        levelIndex={levelIndex} levels={levelTemplates} unlockedLevel={progress.unlockedLevel}
        difficulty={difficulty} bestTimes={progress.bestTimes} elapsed={runElapsed}
        onDifficulty={value => updateProgress(current => ({ ...current, difficulty: value }))}
        settings={settings} onSettings={next => updateProgress(current => ({ ...current, settings: next }))} onReset={resetProgress}
        onChooseLevel={chooseLevel} onStart={startGame}
        onNext={() => chooseLevel(levelIndex + 1)} onRestart={restart} />}
      <span className="sr-only" role="status" aria-live="polite">{paused ? 'Game paused' : status === 'playing' ? 'Game running' : ''}</span>
    </div>
  )
}
