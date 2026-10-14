export function canActivateShrine(shrine,openedDoors=[],activatedShrines=[]) {
  return (shrine.requiresDoors||[]).every(id=>openedDoors.includes(id))
    && (shrine.requiresShrines||[]).every(id=>activatedShrines.includes(id))
}

export function shrineRequirement(level,shrine,openedDoors=[],activatedShrines=[]) {
  const missing=[
    ...(shrine.requiresDoors||[]).filter(id=>!openedDoors.includes(id)).map(id=>`${level.doors.find(d=>d.id===id)?.name||id} seal`),
    ...(shrine.requiresShrines||[]).filter(id=>!activatedShrines.includes(id)).map(id=>`${level.shrines.find(s=>s.id===id)?.name||id} rune`),
  ]
  return `${shrine.name} rune needs ${missing.join(' and ')}`
}

export function nextObjective(level,collectedKeys=[],openedDoors=[],activatedShrines=[]) {
  if(openedDoors.includes('exit')) return 'Exit open — reach the finish!'
  const steps=[
    ['key','ruby','Find the Ruby key to break the first seal.'],
    ['door','ruby','Open the Ruby seal to awaken the Dawn rune.'],
    ['rune','dawn','Light Dawn in Sunwell Clearing; the Ruby seal has awakened it.'],
    ['key','sapphire','Find the Sapphire key beyond the Ruby seal.'],
    ['door','sapphire','Open the Sapphire seal to awaken the Moon rune.'],
    ['rune','moon','Light Moon in Moonwell Clearing; the Sapphire seal has awakened it.'],
    ['rune','watch','Dawn and Moon are lit — complete the ritual in the Watcher’s Court.'],
  ]
  for(const [type,id,text] of steps) {
    const completed=type==='key'?collectedKeys:type==='door'?openedDoors:activatedShrines
    const exists=type==='key'?level.keys.some(k=>k.id===id):type==='door'?level.doors.some(d=>d.id===id):level.shrines.some(s=>s.id===id)
    if(exists && !completed.includes(id)) return text
  }
  return 'The ritual is complete — open the exit seal.'
}
