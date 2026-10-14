import { Canvas } from '@react-three/fiber'
import OpenForest from './environment/OpenForest.jsx'
import Player from './player/Player.jsx'
import QuestObjects from './quest/QuestObjects.jsx'
import Monster from './guardian/Monster.jsx'
import ForestExit from './environment/ForestExit.jsx'
import Flashlight from './lighting/Flashlight.jsx'
import MechanicObjects from './quest/MechanicObjects.jsx'
import EnvironmentalDust from './environment/EnvironmentalDust.jsx'
import MazeAtmosphere from './environment/ForestAtmosphere.jsx'
import DevFrameStats from './rendering/DevFrameStats.jsx'
import ForestSky from './environment/ForestSky.jsx'

export default function GameScene({ session, guardianConfig }) {
  const { levelIndex, status, paused, attempt, collectedKeys, collectedClues, openedDoors, activatedShrines, triggeredTraps, hidden, guardianAlert, isTouch, flashlightBattery, flashlightOn, playerNoise, touchInput, difficulty, settings, graphics, level, timerActive, setGuardianAlert, setPrompt, setStamina, setHidden, setHeading, setExhausted, handleCatchStart, handleCaught, collectKey, collectClue, emitNoise, triggerTrap, activateRitual, openDoor, handlePointerUnlock, handleWin } = session
  return (
      <Canvas shadows={graphics.shadows} dpr={graphics.dpr} frameloop={timerActive || status === 'catching' ? 'always' : 'demand'}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [-6, 1.6, -8], fov: 75, near: 0.03, far: 55 }}>
        <color attach="background" args={['#203536']} />
        <ForestSky />
        {import.meta.env.DEV && new URLSearchParams(window.location.search).has('profile') && <DevFrameStats />}
        <fog attach="fog" args={['#203536', 7, 30]} />
        <hemisphereLight args={['#a6c7d6', '#374638', 0.7]} />
        <MazeAtmosphere level={level} mobile={isTouch} />
        <EnvironmentalDust mobile={isTouch} reducedMotion={settings.reducedMotion} active={timerActive} flashlightOn={flashlightOn && flashlightBattery > 0} />
        <OpenForest level={level} mobile={isTouch} reducedMotion={settings.reducedMotion} graphics={graphics} />
        <ForestExit level={level} collectedClues={collectedClues} activatedRituals={activatedShrines} />
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
          activatedRituals={activatedShrines}
          onAlertChange={setGuardianAlert}
          onCatchStart={handleCatchStart}
          onCaught={handleCaught}
        />
        <QuestObjects level={level} collectedKeys={collectedKeys} collectedClues={collectedClues} openedDoors={openedDoors} activatedRituals={activatedShrines} />
        <MechanicObjects level={level} triggeredTraps={triggeredTraps} activatedShrines={activatedShrines} />
        {(status === 'ready' || status === 'playing' || status === 'catching') && <Player key={`${levelIndex}-${attempt}`} level={level} collectedKeys={collectedKeys} openedDoors={openedDoors}
          collectedClues={collectedClues} onCollectClue={collectClue}
          active={status === 'playing' && !paused}
          mobile={isTouch} touchInput={touchInput}
          reducedMotion={settings.reducedMotion}
          lookSensitivity={settings.lookSensitivity} invertY={settings.invertY}
          onPointerUnlock={handlePointerUnlock}
          activatedShrines={activatedShrines} onCollectKey={collectKey}
          onPromptChange={setPrompt} onStaminaChange={setStamina} onHiddenChange={setHidden}
          onHeadingChange={setHeading}
          guardianAlert={guardianAlert}
          onExhaustionChange={setExhausted}
          onNoise={emitNoise}
          onTriggerTrap={triggerTrap}
          onActivateShrine={activateRitual}
          onOpenDoor={openDoor}
          onWin={handleWin} />}
        <Flashlight intensity={settings.flashlightIntensity} battery={flashlightBattery} on={flashlightOn}
          mobile={isTouch} reducedMotion={settings.reducedMotion} active={timerActive} graphics={graphics} />
      </Canvas>
  )
}
