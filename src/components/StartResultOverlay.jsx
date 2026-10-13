import { useEffect, useRef } from 'react'
import { bestTimeKey } from '../persistence'
import { formatTime } from '../runTimer'

export default function StartResultOverlay({
  status, level, levelIndex, levels, unlockedLevel, difficulty, bestTimes, elapsed,
  onDifficulty, onChooseLevel, onStart, onNext, onRestart,
}) {
  const headingRef = useRef(null)
  useEffect(() => headingRef.current?.focus(), [status])
  const resultTitle = status === 'won' ? 'You reached the forest!' : status === 'lost' ? 'The guardian caught you!' : level.name
  const currentBest = bestTimes[bestTimeKey(level.id, difficulty)]
  return <div className="forest-menu absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
    <div className={`forest-panel w-full max-w-md p-7 text-center ${status === 'lost' ? 'forest-panel--lost' : ''}`}>
      <p className="forest-kicker">{status === 'won' ? 'Beyond the treeline' : status === 'lost' ? 'Lost in the woods' : 'After dark · Forest trails'}</p>
      <h1 id="game-dialog-title" ref={headingRef} tabIndex="-1" className="text-3xl font-bold outline-none">{resultTitle}</h1>
      {status === 'ready' ? <>
        <p className="mt-3">Collect every required key, open the seals, and escape the guardian.</p>
        <label className="mt-5 block text-left text-sm font-semibold" htmlFor="level">Choose a maze</label>
        <select id="level" className="mt-2 w-full rounded border border-slate-600 bg-slate-800 p-2" value={levelIndex} onChange={event => onChooseLevel(Number(event.target.value))}>
          {levels.map((item, index) => <option key={item.id} value={index} disabled={index > unlockedLevel}>
            {item.name}{index > unlockedLevel ? ' — Locked' : ''}
          </option>)}
        </select>
        <label className="mt-4 block text-left text-sm font-semibold" htmlFor="difficulty">Difficulty</label>
        <select id="difficulty" className="mt-2 w-full rounded border border-slate-600 bg-slate-800 p-2" value={difficulty} onChange={event => onDifficulty(event.target.value)}>
          <option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option>
        </select>
        <div className="mt-4 rounded-lg bg-slate-950/50 p-3 text-left text-sm">
          <p className="font-semibold">Best times · {difficulty}</p>
          {levels.slice(0, unlockedLevel + 1).map(item => <p key={item.id} className="mt-1 flex justify-between"><span>{item.name}</span><span className="tabular-nums">{formatTime(bestTimes[bestTimeKey(item.id, difficulty)])}</span></p>)}
        </div>
        <button className="forest-primary mt-5 px-6 py-3 font-semibold" onClick={onStart}>Enter the forest</button>
        <p className="mt-3 text-sm text-slate-400">Desktop: click the scene to capture your mouse.</p>
      </> : <>
        <p className="mt-3">{status === 'won' ? `Escaped in ${formatTime(elapsed)}. Best: ${formatTime(currentBest)}.` : 'Keep moving and use turns to escape the guardian.'}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {status === 'won' && levelIndex < levels.length - 1 && <button className="forest-primary px-5 py-3" onClick={onNext}>Next trail</button>}
          <button className="rounded-lg border border-slate-300 px-5 py-3" onClick={onRestart}>Play again / Menu</button>
        </div>
      </>}
      <p className="mt-4 text-xs text-slate-400">Flashlight by <a className="underline" href="https://skfb.ly/o8H9O" target="_blank" rel="noreferrer">MAR.COS.</a> · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · adapted for the game</p>
      <p className="mt-1 text-xs text-slate-400">Trees by <a className="underline" href="https://skfb.ly/pDzJR" target="_blank" rel="noreferrer">Jungle Jim</a> · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · adapted for the game</p>
      <p className="mt-1 text-xs text-slate-400">Forest road by <a className="underline" href="https://skfb.ly/pMHKA" target="_blank" rel="noreferrer">dasy444</a> · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · adapted for the game</p>
      <p className="mt-1 text-xs text-slate-400">Grass by <a className="underline" href="https://skfb.ly/p6tJE" target="_blank" rel="noreferrer">Cosmic_dust</a> · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · adapted for the game</p>
    </div>
  </div>
}
