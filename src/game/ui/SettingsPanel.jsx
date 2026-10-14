export default function SettingsPanel({ settings, onChange, onReset }) {
  const update = patch => onChange({ ...settings, ...patch })
  return <fieldset className="mt-5 space-y-4 border-t border-slate-700 pt-5 text-left">
    <legend className="px-2 text-lg font-bold">Settings</legend>
    <label className="block text-sm">Graphics
      <select className="mt-1 block w-full rounded p-2" value={settings.graphicsQuality} onChange={event => update({ graphicsQuality: event.target.value })}>
        <option value="performance">Performance · fastest</option>
        <option value="balanced">Balanced</option>
        <option value="high">High detail</option>
      </select>
    </label>
    <label className="block text-sm">Look sensitivity: {settings.lookSensitivity.toFixed(2)}
      <input className="mt-1 block w-full" type="range" min="0.25" max="2" step="0.05" value={settings.lookSensitivity} onChange={event => update({ lookSensitivity: Number(event.target.value) })} />
    </label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={settings.invertY} onChange={event => update({ invertY: event.target.checked })} /> Invert vertical look</label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={settings.reducedMotion} onChange={event => update({ reducedMotion: event.target.checked })} /> Reduced motion</label>
    <label className="block text-sm">Flashlight intensity: {settings.flashlightIntensity}
      <input className="mt-1 block w-full" type="range" min="20" max="100" step="5" value={settings.flashlightIntensity} onChange={event => update({ flashlightIntensity: Number(event.target.value) })} />
    </label>
    <button type="button" className="forest-danger rounded border px-3 py-2 text-sm" onClick={onReset}>Reset progress and settings</button>
  </fieldset>
}
