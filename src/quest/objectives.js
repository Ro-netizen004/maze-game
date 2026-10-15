import { objectiveSteps } from './questDefinitions.js'
export function canCollectOffering(offering, openedDoors = [], activatedShrines = [], collectedOfferings = []) {
  return (offering.requiresDoors || []).every(id => openedDoors.includes(id))
    && (offering.requiresShrines || []).every(id => activatedShrines.includes(id))
    && (offering.requiresOfferings || []).every(id => collectedOfferings.includes(id))
}

export function visibleOfferings(level, openedDoors = [], activatedShrines = [], collectedOfferings = []) {
  return (level.offerings || []).filter(item => !collectedOfferings.includes(item.id)
    && canCollectOffering(item, openedDoors, activatedShrines, collectedOfferings))
}

export function canActivateShrine(shrine,openedDoors=[],activatedShrines=[],collectedOfferings=[]) {
  return (shrine.requiresDoors||[]).every(id=>openedDoors.includes(id))
    && (shrine.requiresShrines||[]).every(id=>activatedShrines.includes(id))
    && (shrine.requiresOfferings||[]).every(id=>collectedOfferings.includes(id))
}

export function shrineRequirement(level,shrine,openedDoors=[],activatedShrines=[],collectedOfferings=[]) {
  const missing=[
    ...(shrine.requiresOfferings||[]).filter(id=>!collectedOfferings.includes(id)).map(id=>level.offerings?.find(o=>o.id===id)?.name||id),
    ...(shrine.requiresDoors||[]).filter(id=>!openedDoors.includes(id)).map(id=>`${level.doors.find(d=>d.id===id)?.name||id} seal`),
    ...(shrine.requiresShrines||[]).filter(id=>!activatedShrines.includes(id)).map(id=>`${level.shrines.find(s=>s.id===id)?.name||id} rune`),
  ]
  return `${shrine.name} rune needs ${missing.join(' and ')}`
}

export function nextObjective(level,collectedKeys=[],openedDoors=[],activatedShrines=[],collectedOfferings=[]) {
  if(openedDoors.includes('exit')) return 'Exit open — reach the finish!'
  for(const [type,id,text] of objectiveSteps) {
    const completed=type==='key'?collectedKeys:type==='door'?openedDoors:type==='offering'?collectedOfferings:activatedShrines
    const exists=type==='key'?level.keys.some(k=>k.id===id):type==='door'?level.doors.some(d=>d.id===id):type==='offering'?(level.offerings||[]).some(o=>o.id===id):level.shrines.some(s=>s.id===id)
    if(exists && !completed.includes(id)) {
      const offering = type==='offering' ? level.offerings.find(item=>item.id===id) : null
      return offering ? `${text} Search near ${offering.hint}.` : text
    }
  }
  return 'The ritual is complete — open the exit seal.'
}
