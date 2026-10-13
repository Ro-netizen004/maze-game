import { formatTime } from '../runTimer'
import { FLASHLIGHT_LOW_THRESHOLD, flashlightBatteryStatus } from '../flashlightBattery'

function KeyIcon() {
  return <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="8" cy="8" r="5" /><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3" /></svg>
}

export default function GameHud({
  level, levelIndex, levelCount, collectedKeys, openedDoors, stamina, hidden, elapsed, prompt, notice, isTouch,
  flashlightBattery, flashlightOn, guardianAlert,
}) {
  const required = level.mechanics.requiredDoors || []
  const openedRequired = required.filter(id => openedDoors.includes(id)).length
  const missingNames = level.doors
    .filter(door => required.includes(door.id) && !openedDoors.includes(door.id))
    .map(door => door.name)
  return <>
    <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-lg border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 shadow">
      <p className="font-bold">{level.name} · Level {levelIndex + 1} / {levelCount}</p>
      <p className="text-lg font-bold tabular-nums" aria-label={`Elapsed time ${formatTime(elapsed)}`}>{formatTime(elapsed)}</p>
      <p>Keys {collectedKeys.length} / {level.keys.length} · Inner doors {openedRequired} / {required.length}</p>
      <p>{openedDoors.includes('exit') ? 'Exit open — reach the finish!' : missingNames.length ? `Find keys and clear: ${missingNames.join(', ')}.` : 'All seals cleared — approach the exit door.'}</p>
      <p>{isTouch ? 'Use the virtual controls to move and look.' : 'WASD · Mouse look (drag if capture is unavailable) · Shift sprint · F flashlight · Space jump · E interact · Esc pause'}</p>
      <p>Stamina {Math.round(stamina)}%{hidden ? ' · Hidden' : ''}</p>
      <p className={`font-semibold ${guardianAlert === 'chase' ? 'text-red-400' : guardianAlert === 'investigate' || guardianAlert === 'search' ? 'text-amber-300' : 'text-emerald-300'}`}>
        Guardian · {guardianAlert === 'chase' ? 'Chasing' : guardianAlert === 'investigate' ? 'Investigating noise' : guardianAlert === 'search' ? 'Searching' : 'Patrolling'}
      </p>
      <div className="mt-2" aria-label={`Flashlight battery ${Math.round(flashlightBattery)} percent, ${flashlightBatteryStatus(flashlightBattery, flashlightOn)}`}>
        <div className="flex justify-between text-xs font-semibold">
          <span>Flashlight · {flashlightBatteryStatus(flashlightBattery, flashlightOn)}</span>
          <span>{Math.round(flashlightBattery)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded bg-slate-700" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(flashlightBattery)}>
          <div className={`h-full transition-[width] ${flashlightBattery <= FLASHLIGHT_LOW_THRESHOLD ? 'bg-amber-400' : 'bg-cyan-300'}`} style={{ width: `${flashlightBattery}%` }} />
        </div>
      </div>
    </div>
    <div className="pointer-events-none absolute bottom-4 left-4 hidden rounded-xl bg-slate-950/90 p-4 text-white shadow-lg sm:block">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">Key inventory</p>
      <div className="flex gap-3">
        {level.keys.map(key => {
          const owned = collectedKeys.includes(key.id)
          return <div key={key.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${owned ? 'border-white/30 bg-white/10' : 'border-white/10 opacity-50'}`} style={{ color: owned ? key.color : '#cbd5e1' }}>
            <KeyIcon />
            <div><p className="text-sm font-bold">{key.name} key</p><p className="text-xs">{owned ? 'Collected ✓' : 'Not found'}</p></div>
          </div>
        })}
      </div>
    </div>
    {prompt && <div className="pointer-events-none absolute bottom-32 left-1/2 -translate-x-1/2 rounded-xl bg-slate-950/90 px-5 py-3 text-center text-white shadow-lg">
      {!isTouch && <span className="mr-3 inline-block rounded border border-white/40 px-2 py-1 font-bold">E</span>}
      <span className={prompt.available === false ? 'text-slate-400' : 'font-bold'}>{prompt.label}</span>
    </div>}
    <div className="pointer-events-none absolute right-4 top-4" role="status" aria-live="polite">
      {notice && <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-slate-950/90 px-5 py-4 text-white shadow-lg">
        <span style={{ color: notice.color }}><KeyIcon /></span>
        <p className="font-bold">{notice.name} key collected!</p>
      </div>}
    </div>
  </>
}
