import { forestJournals } from './journals.js'
export function forestObjective(collected = [], activated = [], level) {
  const journals = level?.clues || forestJournals
  const rituals = level?.rituals || []
  if (level?.longleatMaze) {
    const unlit = rituals.find(ritual => !activated.includes(ritual.id))
    if (unlit && collected.length === journals.length) return { title: 'Activate ' + unlit.name, hint: 'Find the three circular clearings along the middle of the hedge maze. Approach each rune and press E (or Interact). The guardian hears every activation.' }
    const next = journals.find(journal => !collected.includes(journal.id))
    if (next) return { title: 'Find ' + next.name, hint: journals[journals.indexOf(next)-1]?.hint || 'Crown Camp is near the southeast entrance. Follow the hedge paths; recover five journals in any order. The three rune clearings are in the middle.' }
    return { title: 'Return to the Old Road', hint: 'All five journals recovered and three runes lit. Follow the northern corridors to the northeast mountain sign and step into the lantern-lit clearing.' }
  }
  const unlit = journals.find(journal => collected.includes(journal.id) && !activated.includes('ritual-' + journal.id))
  if (unlit) return { title: 'Activate ' + unlit.name + ' rune', hint: 'Look just south of this journal’s stump for the faint turquoise ritual circle and floating marker. Stand near it and press E (or Interact). It stays brightly lit after activation.' }
  const next = journals.find(journal => !collected.includes(journal.id))
  if (!next) return { title: 'Return to the Old Road', hint: 'All five records recovered and runes lit. Head to the southeast mountain sign and step into the lantern-lit clearing.' }
  return { title: 'Find ' + next.name, hint: journals[journals.indexOf(next)-1]?.hint || 'Start at Crown Camp, just southeast of your arrival point. Look beneath the sun sign. Recover five journals in any order.' }
}
