import { formatTime } from '../runTimer'
import { flashlightBatteryStatus } from '../flashlightBattery'
import { forestObjective } from '../forestQuest'

export default function GameHud({ level, collectedClues = [], stamina, hidden, elapsed, prompt, notice, isTouch,
  flashlightBattery, flashlightOn, guardianAlert, onReadJournal, canRead, heading }) {
  const quest = forestObjective(collectedClues)
  const complete = collectedClues.length === level.clues.length
  return <div className="forest-hud pointer-events-none absolute inset-0">
    <div className="forest-compass absolute left-1/2 top-3 -translate-x-1/2 rounded bg-slate-950/90 px-4 py-2 text-xs text-white" aria-label={'Facing ' + heading}>COMPASS · <strong className="text-base">{heading}</strong></div>
    <div className="forest-stats absolute left-3 top-3 max-w-xs rounded-lg bg-slate-950/90 p-3 text-sm text-white">
      <p className="font-bold">The Keeper’s Forest</p>
      <p className="tabular-nums">{formatTime(elapsed)} · Journals {collectedClues.length} / 5</p>
      <p className="mt-1">{complete ? 'All records found · Reach the Old Road' : 'Explore freely · Recover the five records'}</p>
      <p className="mt-2 text-xs">Stamina {Math.round(stamina)}%{hidden ? ' · Hidden' : ''}</p>
      <p className={guardianAlert === 'chase' ? 'text-red-400' : 'text-emerald-300'}>Guardian · {guardianAlert === 'chase' ? 'Chasing' : guardianAlert === 'investigate' ? 'Investigating noise' : guardianAlert === 'search' ? 'Searching' : 'Patrolling'}</p>
      <div className="mt-2 flex justify-between text-xs"><span>Flashlight · {flashlightBatteryStatus(flashlightBattery, flashlightOn)}</span><span>{Math.round(flashlightBattery)}%</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-700" role="progressbar" aria-label="Flashlight battery" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(flashlightBattery)}><div className="h-full bg-cyan-300" style={{ width: flashlightBattery + '%' }} /></div>
      <button className="pointer-events-auto mt-3 rounded border border-white/30 px-3 py-1 disabled:opacity-50" disabled={!canRead || !collectedClues.length} onClick={() => onReadJournal(collectedClues.at(-1))}>Journal archive {isTouch ? '' : '· J'}</button>
    </div>
    <div className="quest-card absolute right-3 top-40 max-w-xs rounded-lg bg-slate-950/90 p-3 text-sm text-white sm:top-36">
      <p className="text-xs uppercase tracking-widest">The keeper’s records</p>
      <p className="mt-2 font-bold">{quest.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{quest.hint}</p>
    </div>
    <div className="absolute bottom-4 left-4 hidden max-w-md rounded-lg bg-slate-950/90 p-3 text-white sm:block">
      <p className="mb-2 text-xs uppercase tracking-widest">Recovered journals · select to reread</p>
      <div className="flex flex-wrap gap-2">{level.clues.map((journal, index) => {
        const owned = collectedClues.includes(journal.id)
        return <button key={journal.id} disabled={!owned || !canRead} onClick={() => onReadJournal(journal.id)} className="pointer-events-auto rounded border border-white/20 px-2 py-1 text-xs disabled:opacity-40" style={{ color: owned ? journal.color : '#cbd5e1' }}>{index + 1}. {owned ? journal.name : 'Undiscovered'}</button>
      })}</div>
      <p className="mt-2 text-xs text-slate-300">WASD · Mouse look · Shift run · Space jump · E interact · F light</p>
    </div>
    {prompt && <div className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-lg bg-slate-950/90 px-4 py-3 text-center text-sm text-white">{isTouch ? '' : 'E · '}{prompt.label}</div>}
    {notice && <div className="absolute right-3 top-3 rounded-lg bg-slate-950/90 p-3 text-sm text-white" role="status">{notice.name} recovered</div>}
  </div>
}
