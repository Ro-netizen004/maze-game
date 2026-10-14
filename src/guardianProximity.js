export function guardianProximityBand(distance,previous=0) {
  if(!Number.isFinite(distance) || distance<0 || distance>=8) return 0
  if(previous===0 && distance>6) return 0
  // Separate entry and exit distances prevent chatter at the edge of range.
  return Math.max(1,Math.min(10,Math.ceil((8-distance)/8*10)))
}
