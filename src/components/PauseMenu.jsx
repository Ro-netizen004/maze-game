import { useEffect, useRef } from 'react'
import SettingsPanel from './SettingsPanel'

export default function PauseMenu({ settings, onSettings, onReset, onResume, onMenu, multiplayer = false }) {
  const resumeRef = useRef(null)
  useEffect(() => resumeRef.current?.focus(), [])
  return <div className="forest-menu absolute inset-0 z-30 flex items-center justify-center overflow-auto bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <div className="forest-panel w-full max-w-md p-7 text-center">
      <h1 id="pause-title" className="text-3xl font-bold">Paused</h1>
      {multiplayer && <p className="mt-2 text-sm text-amber-200">The co-op world keeps running while your menu is open.</p>}
      <div className="mt-5 flex justify-center gap-3">
        <button ref={resumeRef} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold" onClick={onResume}>Resume</button>
        <button className="rounded-lg border border-slate-400 px-5 py-3" onClick={onMenu}>Main menu</button>
      </div>
      <SettingsPanel settings={settings} onChange={onSettings} onReset={onReset} />
    </div>
  </div>
}
