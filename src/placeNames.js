const names={
  stonegate:'The Forgotten Garden',
  'amber-halls':'The Keeper’s Grounds',
  'twilight-labyrinth':'The Ritual Grove',
}
const clearingNames={dawn:'Sunwell Clearing',moon:'Moonwell Clearing',watch:'The Watcher’s Court'}

export function namePlaces(level) {
  // Preserve map IDs and layout lookup names so saved progress and geometry
  // remain stable while menus, signs and objectives use the new names.
  return {...level,layoutName:level.name,name:names[level.id]||level.name,
    clearings:level.clearings.map(c=>({...c,placeName:clearingNames[c.id]})),
    shrines:level.shrines.map(s=>({...s,placeName:clearingNames[s.id]})),
  }
}
