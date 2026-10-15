import { carriedQuestItems } from '../quest/questInventory.js'

function ItemIcon({ model }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7 shrink-0" aria-hidden="true">
    {model === 'key' ? <><circle cx="7" cy="7" r="4" /><path d="m10 10 11 11m-4-4 3-3m-7 0 3-3" /></>
      : model === 'sun-ember' ? <><circle cx="12" cy="12" r="5" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2" /></>
      : model === 'moon-tear' ? <><path d="M9 2h6v5l4 7v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6l4-7ZM8 16h8M9 5h6" /></>
      : model === 'ritual-candle' ? <><path d="M8 12h8v10H8Zm4 0V9" /><path d="M12 1c-4 5-3 8 0 8s4-3 0-8Z" /></>
      : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
}

export default function QuestInventory({ level, collectedKeys, openedDoors, collectedOfferings, activatedShrines, isTouch, multiplayer = false }) {
  const carried = carriedQuestItems(level,collectedKeys,openedDoors,collectedOfferings,activatedShrines)
  return <section aria-label="Carried inventory" className={`pointer-events-none absolute rounded-xl border border-white/15 bg-slate-950/90 p-3 text-white shadow-lg ${isTouch ? 'right-3 bottom-24 max-w-[145px]' : 'bottom-4 left-4 max-w-xs'}`}>
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-300">{multiplayer ? 'Team inventory' : 'Inventory'} · {carried.length}</p>
    {carried.length ? <ul className="grid gap-2">{carried.map(item => <li key={item.id} className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2 py-2" style={{color:item.color}}>
      <ItemIcon model={item.model} /><span className="text-xs font-semibold">{item.name}</span>
    </li>)}</ul> : <p className="text-xs text-slate-400">No items carried</p>}
  </section>
}
