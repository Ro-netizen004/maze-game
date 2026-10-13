import { useRef, useState } from 'react'

const buttonClass = 'pointer-events-auto flex h-14 min-w-14 select-none items-center justify-center rounded-full border border-white/40 bg-slate-950/70 px-3 text-xs font-bold text-white active:bg-indigo-600'

export default function MobileControls({ inputRef, flashlightOn, onToggleFlashlight }) {
  const stickRef = useRef(null)
  const lookRef = useRef(null)
  const [stick, setStick] = useState([0, 0])

  const setButton = (name, value) => { inputRef.current[name] = value }
  const releaseButton = name => () => setButton(name, false)
  const moveStick = event => {
    const rect = stickRef.current.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)))
    const y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)))
    inputRef.current.right = x
    inputRef.current.forward = -y
    setStick([x, y])
  }
  const clearStick = () => {
    inputRef.current.right = 0
    inputRef.current.forward = 0
    setStick([0, 0])
  }
  const beginLook = event => {
    lookRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveLook = event => {
    if (lookRef.current?.id !== event.pointerId) return
    inputRef.current.lookX += event.clientX - lookRef.current.x
    inputRef.current.lookY += event.clientY - lookRef.current.y
    lookRef.current.x = event.clientX
    lookRef.current.y = event.clientY
  }
  return <div className="pointer-events-none absolute inset-0 z-10 touch-none" aria-label="Touch game controls">
    <div className="pointer-events-auto absolute inset-y-0 right-0 w-1/2" aria-label="Drag to look" onPointerDown={beginLook} onPointerMove={moveLook} onPointerUp={() => { lookRef.current = null }} onPointerCancel={() => { lookRef.current = null }} />
    <div ref={stickRef} className="pointer-events-auto absolute bottom-6 left-5 h-32 w-32 rounded-full border-2 border-white/30 bg-slate-950/40"
      aria-label="Movement stick" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); moveStick(event) }} onPointerMove={event => event.currentTarget.hasPointerCapture(event.pointerId) && moveStick(event)} onPointerUp={clearStick} onPointerCancel={clearStick}>
      <span className="absolute h-12 w-12 rounded-full bg-white/50" style={{ left: `calc(50% - 1.5rem + ${stick[0] * 35}px)`, top: `calc(50% - 1.5rem + ${stick[1] * 35}px)` }} />
    </div>
    <div className="absolute bottom-5 right-4 flex items-end gap-2">
      <button type="button" className={buttonClass} aria-pressed={flashlightOn}
        onPointerDown={event => { event.stopPropagation(); onToggleFlashlight() }}>
        Light {flashlightOn ? 'On' : 'Off'}
      </button>
      {['jump', 'sprint', 'interact'].map(name => <button key={name} className={buttonClass}
        onPointerDown={event => { event.stopPropagation(); setButton(name, true) }}
        onPointerUp={releaseButton(name)} onPointerCancel={releaseButton(name)} onPointerLeave={releaseButton(name)}>
        {name === 'interact' ? 'Use' : name[0].toUpperCase() + name.slice(1)}
      </button>)}
    </div>
  </div>
}
