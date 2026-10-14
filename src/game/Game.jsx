import GameHud from './ui/GameHud.jsx'
import StartResultOverlay from './ui/StartResultOverlay.jsx'
import PauseMenu from './ui/PauseMenu.jsx'
import MobileControls from './ui/MobileControls.jsx'
import JournalReader from './ui/JournalReader.jsx'
import useGameSession from './hooks/useGameSession.js'
import GameScene from './GameScene.jsx'
const defaultGuardianConfig = Object.freeze({})
export default function Game({ guardianConfig = defaultGuardianConfig }) {
  const session = useGameSession()
  const { levelTemplates, progress, levelIndex, status, paused, readingJournal, collectedKeys, collectedClues, openedDoors, activatedShrines, prompt, stamina, exhausted, hidden, guardianAlert, heading, notice, elapsed, isTouch, flashlightBattery, flashlightOn, touchInput, difficulty, settings, level, recoveredJournals, setReadingJournal, openJournal, closeJournal, pauseGame, toggleFlashlight, updateSettings, updateDifficulty, resetProgress, resume, restart, chooseLevel, startGame, nextLevel } = session
  return (
    <div className={`relative h-screen w-full ${status === 'catching' ? 'guardian-caught' : ''}`}>
      <GameScene session={session} guardianConfig={guardianConfig} />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.22) 100%)' }} />
      {(status === 'playing' || status === 'catching') && <GameHud level={level} levelIndex={levelIndex} levelCount={levelTemplates.length}
        collectedKeys={collectedKeys} collectedClues={collectedClues} openedDoors={openedDoors} stamina={stamina} hidden={hidden} exhausted={exhausted}
        elapsed={elapsed} prompt={status === 'playing' ? prompt : null} notice={notice} isTouch={isTouch}
        flashlightBattery={flashlightBattery} flashlightOn={flashlightOn} guardianAlert={guardianAlert} activatedRituals={activatedShrines}
        onReadJournal={openJournal} canRead={status === 'playing' && !paused} heading={heading} />}
      {status === 'playing' && !paused && <button className="forest-pause absolute right-4 top-24 z-20 px-4 py-2 font-semibold" onClick={pauseGame}>Pause</button>}
      {status === 'playing' && !paused && isTouch && <MobileControls inputRef={touchInput}
        flashlightOn={flashlightOn} onToggleFlashlight={toggleFlashlight} />}
      {status === 'catching' && <div className="caught-vignette pointer-events-none absolute inset-0" aria-hidden="true" />}
      {readingJournal && status === 'playing' && <JournalReader journals={recoveredJournals} selectedId={readingJournal} onSelect={setReadingJournal} onClose={closeJournal} />}
      {paused && !readingJournal && status === 'playing' && <PauseMenu settings={settings}
        onSettings={updateSettings}
        onReset={resetProgress} onResume={resume} onMenu={restart} />}
      {status !== 'playing' && status !== 'catching' && <StartResultOverlay status={status} level={level}
        levelIndex={levelIndex} levels={levelTemplates} unlockedLevel={progress.unlockedLevel}
        difficulty={difficulty} bestTimes={progress.bestTimes} elapsed={elapsed}
        onDifficulty={updateDifficulty}
        onChooseLevel={chooseLevel} onStart={startGame}
        onNext={nextLevel} onRestart={restart} />}
      <span className="sr-only" role="status" aria-live="polite">{paused ? 'Game paused' : status === 'playing' ? 'Game running' : ''}</span>
    </div>
  )
}
