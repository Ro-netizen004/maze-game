import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ForestMaze from './ForestMaze'
import Player from './Player'
import { levelTemplates } from './levels'
import { createSeededLevel } from './levelRuntime'
import QuestObjects from './QuestObjects'
import Monster from './Monster'
import ForestExit from './ForestExit'
import Flashlight from './Flashlight'
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

export default function App({ guardianConfig = {} }) {
  const [progress, setProgress] = useState(loadProgress)
  const [levelIndex, setLevelIndex] = useState(0)
  const [status, setStatus] = useState('ready')
  const [paused, setPaused] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [collectedKeys, setCollectedKeys] = useState([])
  const [collectedClues, setCollectedClues] = useState([])
  const [openedDoors, setOpenedDoors] = useState([])
  const [activatedShrines, setActivatedShrines] = useState([])
  const [triggeredTraps, setTriggeredTraps] = useState([])
  const [prompt, setPrompt] = useState(null)
  const [stamina, setStamina] = useState(100)
  const [hidden, setHidden] = useState(false)
  const [guardianAlert, setGuardianAlert] = useState('patrol')
  const [notice, setNotice] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [isTouch, setIsTouch] = useState(false)
  const [flashlightBattery, setFlashlightBattery] = useState(100)
  const [flashlightOn, setFlashlightOn] = useState(true)
  const playerNoise = useRef(null)
  const touchInput = useRef({ forward: 0, right: 0, jump: false, sprint: false, interact: false, lookX: 0, lookY: 0 })
  const elapsedRef = useRef(0)
  const timerNow = useRef(null)
  const noiseId = useRef(0)
  const difficulty = progress.difficulty
  const settings = progress.settings
  const level = useMemo(() => createSeededLevel(levelTemplates[levelIndex], `${levelTemplates[levelIndex].id}:${attempt}`), [levelIndex, attempt])
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
      elapsedRef.current = advanceTimer(elapsedRef.current, timerNow.current, now, true)
      timerNow.current = now
      setElapsed(elapsedRef.current)
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
  function collectKey(id) {
    if (collectedKeys.includes(id)) return
    const key = level.keys.find(item => item.id === id)
    setCollectedKeys(items => items.includes(id) ? items : [...items, id])
    setNotice({ name: key.name, color: key.color })
  }
  function restart() {
    setNotice(null)
    setCollectedKeys([])
    setCollectedClues([])
    setOpenedDoors([])
    setActivatedShrines([])
    setTriggeredTraps([])
    setPrompt(null)
    setStamina(100)
    setFlashlightBattery(100)
    setFlashlightOn(true)
    setHidden(false)
    setGuardianAlert('patrol')
    playerNoise.current = null
    elapsedRef.current = 0
    setElapsed(0)
    setPaused(false)
    setAttempt(value => value + 1)
    setStatus('ready')
  }
  function chooseLevel(index) {
    if (index > progress.unlockedLevel) return
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
    setPaused(false)
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
      <Canvas shadows dpr={isTouch ? [1, 1] : [1, 1.25]}
        gl={{ antialias: !isTouch, powerPreference: isTouch ? 'low-power' : 'high-performance' }}
        camera={{ position: [-6, 1.6, -8], fov: 75, near: 0.03, far: 22 }}>
        <color attach="background" args={['#203536']} />
        <fog attach="fog" args={['#203536', 3, 14 + Math.min(activatedShrines.length * (level.mechanics.shrineVisibilityBoost || 0), 4)]} />
        <hemisphereLight args={['#91afc2', '#26372f', 0.48]} />
        <MazeAtmosphere level={level} mobile={isTouch} />
        <EnvironmentalDust mobile={isTouch} reducedMotion={settings.reducedMotion} active={timerActive} flashlightOn={flashlightOn && flashlightBattery > 0} />
        <ForestMaze level={level} mobile={isTouch} reducedMotion={settings.reducedMotion} />
        <ForestExit level={level} />
        <Monster
          key={`monster-${levelIndex}-${attempt}`}
          level={level}
          openedDoors={openedDoors}
          active={status === 'playing' || status === 'catching'}
          paused={paused && status !== 'catching'}
          hidden={hidden}
          playerNoise={playerNoise}
          difficulty={difficulty}
          mobile={isTouch}
          guardianConfig={guardianConfig}
          onAlertChange={setGuardianAlert}
          onCatchStart={() => setStatus(current => current === 'playing' ? 'catching' : current)}
          onCaught={() => {
            setNotice(null)
            setStatus(current => current === 'catching' ? 'lost' : current)
          }}
        />
        <QuestObjects level={level} collectedKeys={collectedKeys} collectedClues={collectedClues} openedDoors={openedDoors} />
        <MechanicObjects level={level} triggeredTraps={triggeredTraps} activatedShrines={activatedShrines} />
        {(status === 'ready' || status === 'playing' || status === 'catching') && <Player key={`${levelIndex}-${attempt}`} level={level} collectedKeys={collectedKeys} openedDoors={openedDoors}
          collectedClues={collectedClues} onCollectClue={id => setCollectedClues(items => items.includes(id) ? items : [...items, id])}
          active={status === 'playing' && !paused}
          mobile={isTouch} touchInput={touchInput}
          reducedMotion={settings.reducedMotion}
          lookSensitivity={settings.lookSensitivity} invertY={settings.invertY}
          onPointerUnlock={handlePointerUnlock}
          activatedShrines={activatedShrines} onCollectKey={collectKey}
          onPromptChange={setPrompt} onStaminaChange={setStamina} onHiddenChange={setHidden}
          onNoise={noise => { playerNoise.current = { ...noise, id: ++noiseId.current } }}
          onTriggerTrap={id => setTriggeredTraps(items => items.includes(id) ? items : [...items, id])}
          onActivateShrine={id => setActivatedShrines(items => items.includes(id) ? items : [...items, id])}
          onOpenDoor={id => setOpenedDoors(items => items.includes(id) ? items : [...items, id])}
          onWin={handleWin} />}
        <Flashlight intensity={settings.flashlightIntensity} battery={flashlightBattery} on={flashlightOn}
          mobile={isTouch} reducedMotion={settings.reducedMotion} active={timerActive} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.22) 100%)' }} />
      {(status === 'playing' || status === 'catching') && <GameHud level={level} levelIndex={levelIndex} levelCount={levelTemplates.length}
        collectedKeys={collectedKeys} collectedClues={collectedClues} openedDoors={openedDoors} stamina={stamina} hidden={hidden}
        elapsed={elapsed} prompt={status === 'playing' ? prompt : null} notice={notice} isTouch={isTouch}
        flashlightBattery={flashlightBattery} flashlightOn={flashlightOn} guardianAlert={guardianAlert} />}
      {status === 'playing' && !paused && <button className="forest-pause absolute right-4 top-24 z-20 px-4 py-2 font-semibold" onClick={pauseGame}>Pause</button>}
      {status === 'playing' && !paused && isTouch && <MobileControls inputRef={touchInput}
        flashlightOn={flashlightOn} onToggleFlashlight={toggleFlashlight} />}
      {status === 'catching' && <div className="caught-vignette pointer-events-none absolute inset-0" aria-hidden="true" />}
      {paused && status === 'playing' && <PauseMenu settings={settings}
        onSettings={next => updateProgress(current => ({ ...current, settings: next }))}
        onReset={resetProgress} onResume={resume} onMenu={restart} />}
      {status !== 'playing' && status !== 'catching' && <StartResultOverlay status={status} level={level}
        levelIndex={levelIndex} levels={levelTemplates} unlockedLevel={progress.unlockedLevel}
        difficulty={difficulty} bestTimes={progress.bestTimes} elapsed={elapsed}
        onDifficulty={value => updateProgress(current => ({ ...current, difficulty: value }))}
        onChooseLevel={chooseLevel} onStart={startGame}
        onNext={() => chooseLevel(levelIndex + 1)} onRestart={restart} />}
      <span className="sr-only" role="status" aria-live="polite">{paused ? 'Game paused' : status === 'playing' ? 'Game running' : ''}</span>
    </div>
  )
}
