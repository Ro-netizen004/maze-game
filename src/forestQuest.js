export function forestObjective(keys = [], doors = [], clues = []) {
  const steps = [
    [keys.includes('ruby'), 'Find the Ruby key', 'Search the short trail east of CROWN GATE, near the starting clearing.'],
    [doors.includes('ruby'), 'Open the Ruby seal', 'Follow the starting trail south to the red door.'],
    [keys.includes('emerald'), 'Find the Emerald key', 'Search the clearing immediately south of OWL WATCH. The central loops give you escape routes.'],
    [doors.includes('emerald'), 'Open the Emerald chamber', 'From the central clearing, follow the eastern trail to the green door.'],
    [clues.includes('dawn-note'), 'Read the Dawn journal', 'Beyond the Emerald door, check the stump in the eastern chamber. Press E to take the journal.'],
    [keys.includes('amber'), 'Find the Amber key', 'Follow the southern loop to FALLEN ARCH. Look beside its landmark sign.'],
    [doors.includes('amber'), 'Open the Amber chamber', 'Return to MOON TURN in the southwest. The Amber door is just south of the sign.'],
    [clues.includes('dusk-note'), 'Read the Dusk journal', 'Search the stump beyond the Amber door.'],
    [keys.includes('sapphire'), 'Find the Sapphire key', 'MOON HOLLOW is in the northeast grove. Try the northern or central loop.'],
    [doors.includes('sapphire'), 'Open the Sapphire seal', 'Take the southern loop east, toward LAST BASTION and the blue door.'],
    [doors.includes('exit'), 'Open the exit', 'All four seals and both journals are needed. The exit is at the southeast end of the trail.'],
  ]
  const next = steps.find(([done]) => !done)
  return next ? { title: next[1], hint: next[2] } : { title: 'Escape the keeper’s forest', hint: 'Walk through the open exit to finish the quest.' }
}
