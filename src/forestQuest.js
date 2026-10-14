import { forestJournals } from './journals.js'
export function forestObjective(collected = [], activated = []) {
  const unlit = forestJournals.find(journal => collected.includes(journal.id) && !activated.includes(`ritual-${journal.id}`))
  if (unlit) return { title: `Activate ${unlit.name} rune`, hint: 'Look just south of this journal’s stump for the faint turquoise ritual circle and floating marker. Stand near it and press E (or Interact). It stays brightly lit after activation.' }
  const next = forestJournals.find(journal => !collected.includes(journal.id))
  if (!next) return { title: 'Return to the Old Road', hint: 'All five records recovered and runes lit. Head to the southeast mountain sign and step into the lantern-lit clearing.' }
  const previous = forestJournals[forestJournals.indexOf(next) - 1]
  return { title: 'Find ' + next.name, hint: previous?.hint || 'Start at Crown Camp, just southeast of your arrival point. Look beneath the sun sign. Recover five journals in any order.' }
}
