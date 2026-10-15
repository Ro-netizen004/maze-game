import { canCollectOffering } from '../quest/objectives.js'

export const CARRY_LIMIT=2
export const RESPAWN_SECONDS=15
export function carriedRelics(level,quest,playerId) {
  return level.offerings.filter(item=>quest.carriers?.[item.id]===playerId)
}
export function availableRelics(level,quest) {
  return level.offerings.filter(item=>!quest.carriers?.[item.id]&&!quest.depositedOfferings?.includes(item.id)
    &&canCollectOffering(item,quest.openedDoors,quest.activatedShrines))
    .map(item=>({...item,cell:quest.droppedOfferings?.[item.id]||item.cell}))
}
export function currentRitual(level,quest) {
  return level.shrines.find(shrine=>!quest.activatedShrines.includes(shrine.id))
}
export function ritualInteraction(level,quest,playerId,shrine) {
  const active=currentRitual(level,quest)
  if(active?.id!==shrine.id)return {available:false,label:`First complete ${active?.name||'the previous'} ritual`}
  const carried=carriedRelics(level,quest,playerId).filter(item=>item.rune===shrine.id)
  const count=shrine.requiresOfferings.filter(id=>quest.depositedOfferings.includes(id)).length
  if(carried.length)return {type:'deposit',available:true,label:`Place ${carried.length} relic${carried.length===1?'':'s'} · ${shrine.placeName}`}
  return {type:'shrine',available:count===shrine.requiresOfferings.length,
    label:count===shrine.requiresOfferings.length?`Activate ${shrine.name} rune`:`${shrine.name} · ${count}/${shrine.requiresOfferings.length} relics placed`}
}
export function coopObjective(level,quest) {
  if(quest.openedDoors.includes('exit'))return 'Exit open — regroup at the Old Road!'
  const shrine=currentRitual(level,quest)
  if(!shrine)return 'All four runes lit — open the Old Road exit.'
  const n=shrine.requiresOfferings.filter(id=>quest.depositedOfferings.includes(id)).length
  return `${shrine.name}: deliver four relics to ${shrine.placeName} · ${n}/4 placed`
}
