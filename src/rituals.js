import { cellPosition } from './levels.js'

export const RITUAL_INTERACTION_DISTANCE = 3

export function nearbyRitual(level, x, z, activated = []) {
  return (level.rituals || []).filter(item => !activated.includes(item.id))
    .map(item => ({ item, distance: Math.hypot(x - cellPosition(level, item.cell)[0], z - cellPosition(level, item.cell)[1]) }))
    .filter(entry => entry.distance <= RITUAL_INTERACTION_DISTANCE)
    .sort((a, b) => a.distance - b.distance)[0]?.item || null
}
