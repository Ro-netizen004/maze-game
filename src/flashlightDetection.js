import { hasLineOfSight } from './levelRuntime.js'
import { worldCell } from './navigation.js'

// A lit beam reveals its source even if the guardian is facing away or the
// player is in cover. Walls and closed gates still block the signal.
export function flashlightHitsGuardian({level,openedDoors=[],playerPosition,playerDirection,guardianPosition,flashlightOn=false,range=14}) {
  if(!flashlightOn) return false
  const dx=guardianPosition[0]-playerPosition[0],dz=guardianPosition[1]-playerPosition[2]
  const length=Math.hypot(...playerDirection)||1
  const inBeam=[0.45,1.2,2.1].some(height=>{
    const dy=height-playerPosition[1],distance=Math.hypot(dx,dy,dz)
    return distance<=range && (distance<0.001 || (dx*playerDirection[0]+dy*playerDirection[1]+dz*playerDirection[2])/(distance*length)>=Math.cos(0.56))
  })
  if(!inBeam) return false
  return hasLineOfSight(level,worldCell(level,playerPosition[0],playerPosition[2]),worldCell(level,...guardianPosition),openedDoors)
}

export function guardianCanCatch({distance,sameCell,hidden=false,flashlightExposure=false,exposedRemaining=0,revealedShelterPosition,playerPosition}) {
  const revealedShelter=exposedRemaining>0 && revealedShelterPosition && Math.hypot(revealedShelterPosition[0]-playerPosition[0],revealedShelterPosition[1]-playerPosition[1])<1
  return distance<0.9 && sameCell && (!hidden || flashlightExposure || Boolean(revealedShelter))
}
