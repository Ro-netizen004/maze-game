import { useEffect, useRef } from 'react'
import SettingsPanel from './SettingsPanel'

export default function PauseMenu({ settings, onSettings, onReset, onResume, onMenu }) {
  const resumeRef = useRef(null)
  useEffect(() => resumeRef.current?.focus(), [])
  return <div className="absolute inset-0 z-30 flex items-center justify-center overflow-auto bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="pause-title">
    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 text-center text-slate-100 shadow-xl">
      <h1 id="pause-title" className="text-3xl font-bold">Paused</h1>
      <div className="mt-5 flex justify-center gap-3">
        <button ref={resumeRef} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold" onClick={onResume}>Resume</button>
        <button className="rounded-lg border border-slate-400 px-5 py-3" onClick={onMenu}>Main menu</button>
      </div>
      <SettingsPanel settings={settings} onChange={onSettings} onReset={onReset} />
    </div>
  </div>
}
