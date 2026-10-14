import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { levelTemplates } from '../world/levels.js'
import { createSeededLevel } from '../world/levelRuntime.js'
import { createDefaultProgress, loadProgress, recordWin, saveProgress } from '../state/persistence.js'
import { advanceTimer } from '../state/runTimer.js'
import { updateFlashlightBattery } from '../lighting/flashlightBattery.js'
import { journalCollection } from '../quest/journals.js'
import { graphicsPreset } from '../rendering/graphics.js'

export default function useGameSession() {
  const [progress, setProgress] = useState(loadProgress)
  const [levelIndex, setLevelIndex] = useState(0)
  const [status, setStatus] = useState('ready')
  const [paused, setPaused] = useState(false)
  const [readingJournal, setReadingJournal] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [collectedKeys, setCollectedKeys] = useState([])
  const [collectedClues, setCollectedClues] = useState([])
  const [openedDoors, setOpenedDoors] = useState([])
  const [activatedShrines, setActivatedShrines] = useState([])
  const [triggeredTraps, setTriggeredTraps] = useState([])
  const [prompt, setPrompt] = useState(null)
  const [stamina, setStamina] = useState(100)
  const [exhausted, setExhausted] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [guardianAlert, setGuardianAlert] = useState('patrol')
  const [heading, setHeading] = useState('S')
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
  const graphics = graphicsPreset(settings.graphicsQuality, isTouch)
  const level = useMemo(() => createSeededLevel(levelTemplates[levelIndex], `${levelTemplates[levelIndex].id}:${attempt}`), [levelIndex, attempt])
  const timerActive = status === 'playing' && !paused
  const recoveredJournals = useMemo(() => journalCollection(level, collectedKeys, collectedClues), [level, collectedKeys, collectedClues])
  const captureMouse = useCallback(() => {
    const canvas = document.querySelector('canvas')
    document.activeElement?.blur?.()
    if (!isTouch && canvas && document.pointerLockElement !== canvas) {
      try { canvas.requestPointerLock?.()?.catch(() => {}) } catch { /* Drag-to-look remains available. */ }
    }
  }, [isTouch])
  const openJournal = useCallback(id => {
    setReadingJournal(id)
    setPaused(true)
    document.exitPointerLock?.()
  }, [])
  const closeJournal = useCallback(() => {
    setReadingJournal(null)
    setPaused(false)
    captureMouse()
  }, [captureMouse])

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
      if (status === 'playing' && !event.repeat && (event.code === 'KeyJ' || (event.key === 'Escape' && readingJournal))) {
        event.preventDefault()
        if (readingJournal) closeJournal()
        else if (!paused && recoveredJournals.length) openJournal(recoveredJournals.at(-1).id)
        return
      }
      if (event.code === 'KeyF' && !event.repeat && status === 'playing' && !paused) {
        event.preventDefault()
        setFlashlightOn(value => value ? false : flashlightBattery > 0)
      }
      if (event.key === 'Escape' && status === 'playing' && !paused) setPaused(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flashlightBattery, paused, status, readingJournal, recoveredJournals, openJournal, closeJournal])
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
    openJournal(id)
  }
  function collectClue(id) {
    setCollectedClues(items => items.includes(id) ? items : [...items, id])
    const journal = level.clues.find(item => item.id === id)
    setNotice({ name: `${journal.name} recovered`, color: journal.color })
    openJournal(id)
  }
  function restart() {
    setNotice(null)
    setReadingJournal(null)
    setCollectedKeys([])
    setCollectedClues([])
    setOpenedDoors([])
    setActivatedShrines([])
    setTriggeredTraps([])
    setPrompt(null)
    setStamina(100)
    setExhausted(false)
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
  function emitNoise(noise) { playerNoise.current = { ...noise, id: ++noiseId.current } }
  function handleCatchStart() { setStatus(current => current === 'playing' ? 'catching' : current) }
  function handleCaught() { setNotice(null); setStatus(current => current === 'catching' ? 'lost' : current) }
  function triggerTrap(id) { setTriggeredTraps(items => items.includes(id) ? items : [...items, id]) }
  function openDoor(id) { setOpenedDoors(items => items.includes(id) ? items : [...items, id]) }
  function activateRitual(id) {
    setActivatedShrines(items => items.includes(id) ? items : [...items, id])
    const ritual = level.rituals?.find(item => item.id === id)
    if (ritual) setNotice({ name: ritual.name + ' activated — the guardian heard it', color: ritual.color })
  }
  function updateSettings(settings) { updateProgress(current => ({ ...current, settings })) }
  function updateDifficulty(difficulty) { updateProgress(current => ({ ...current, difficulty })) }
  function nextLevel() { chooseLevel(levelIndex + 1) }
  return {
    levelTemplates,
    progress,
    levelIndex,
    status,
    paused,
    readingJournal,
    attempt,
    collectedKeys,
    collectedClues,
    openedDoors,
    activatedShrines,
    triggeredTraps,
    prompt,
    stamina,
    exhausted,
    hidden,
    guardianAlert,
    heading,
    notice,
    elapsed,
    isTouch,
    flashlightBattery,
    flashlightOn,
    playerNoise,
    touchInput,
    difficulty,
    settings,
    graphics,
    level,
    timerActive,
    recoveredJournals,
    setGuardianAlert,
    setPrompt,
    setStamina,
    setHidden,
    setHeading,
    setExhausted,
    setReadingJournal,
    handleCatchStart,
    handleCaught,
    collectKey,
    collectClue,
    emitNoise,
    triggerTrap,
    activateRitual,
    openDoor,
    handlePointerUnlock,
    handleWin,
    openJournal,
    closeJournal,
    pauseGame,
    toggleFlashlight,
    updateSettings,
    updateDifficulty,
    resetProgress,
    resume,
    restart,
    chooseLevel,
    startGame,
    nextLevel
  }
}
