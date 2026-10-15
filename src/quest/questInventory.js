// Collection history prevents respawns; carried inventory excludes deposited relics.
export function carriedQuestItems(level, collectedKeys = [], openedDoors = [], collectedOfferings = [], activatedShrines = []) {
  return [
    ...level.keys.filter(key => collectedKeys.includes(key.id)
      && !level.doors.some(door => door.keyId === key.id && door.kind !== 'shortcut' && openedDoors.includes(door.id)))
      .map(key => ({ ...key, name: `${key.name} key`, model: 'key' })),
    ...(level.offerings || []).filter(item => collectedOfferings.includes(item.id) && !activatedShrines.includes(item.rune)),
  ]
}

export function depositedOfferings(level, activatedShrines = []) {
  return (level.offerings || []).filter(item => activatedShrines.includes(item.rune))
}
