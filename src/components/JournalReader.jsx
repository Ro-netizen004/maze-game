import { useEffect, useRef } from 'react'

export default function JournalReader({ journals, selectedId, onSelect, onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const journal = journals.find(item => item.id === selectedId) || journals[0]
  useEffect(() => { closeRef.current?.focus() }, [])
  function trapFocus(event) {
    if (event.key !== 'Tab') return
    const controls = [...panelRef.current.querySelectorAll('button')]
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return <div className="journal-backdrop absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-8">
    <section ref={panelRef} className="journal-reader" role="dialog" aria-modal="true" aria-labelledby="journal-title" onKeyDown={trapFocus}>
      <header className="journal-toolbar">
        <span>The keeper’s archive · {journals.length} recovered</span>
        <button ref={closeRef} onClick={onClose}>Return to forest <span aria-hidden="true">×</span></button>
      </header>
      <div className="journal-layout">
        <nav aria-label="Collected journals" className="journal-shelf">
          {journals.map(item => <button key={item.id} aria-pressed={item.id === journal.id} onClick={() => onSelect(item.id)}>
            <span className="journal-spine" style={{ background: item.color || '#c9ac73' }} />{item.name}
          </button>)}
        </nav>
        <article className="journal-page" key={journal.id}>
          <p className="journal-eyebrow">{journal.subtitle || 'The keeper’s field notes'}</p>
          <h2 id="journal-title">{journal.name}</h2>
          <p className="journal-story">{journal.text}</p>
          <aside className="journal-clue"><h3>Trail notes</h3><p>{journal.hint}</p></aside>
          <p className="journal-footnote">At this site, find the ritual circle just south of the stump. Approach its floating marker and press E or Interact to light it. All five circles must be activated before you leave.</p>
          <p className="journal-footnote">The forest is paused while you read. Press J or Escape to return.</p>
        </article>
      </div>
    </section>
  </div>
}
