import { forestJournals } from './journals.js'
export function forestObjective(collected = []) {
  const next = forestJournals.find(journal => !collected.includes(journal.id))
  if (!next) return { title: 'Return to the Old Road', hint: 'All five records recovered. Head to the southeast mountain sign and step into the lantern-lit clearing.' }
  const previous = forestJournals[forestJournals.indexOf(next) - 1]
  return { title: 'Find ' + next.name, hint: previous?.hint || 'Start at Crown Camp, just southeast of your arrival point. Look beneath the sun sign. Recover five journals in any order.' }
}
