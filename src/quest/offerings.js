import { ritualDefinitions } from './questDefinitions.js'
import { reachableCells } from '../levelRuntime.js'
import { getLandmarks } from '../landmarks.js'
import { findPath } from '../navigation.js'

export { canCollectOffering } from './objectives.js'

// Place each relic along a reachable trail, away from its ritual and other props.
export function addOfferings(level) {
  const landmarks = getLandmarks(level)
  const used = new Set([level.start, level.end, ...level.keys.map(item => item.cell),
    ...Object.values(level.keySpawnPools).flat(), ...level.doors.map(item => item.cell),
    ...level.hidingSpots.map(item => item.cell), ...level.traps.map(item => item.cell),
    ...landmarks.map(item => item.cell)].map(cell => cell.join(',')))
  const sequence = ritualDefinitions.flatMap(definition => [
    { ...definition, model: definition.id, clue: definition.name+' collected. Find its ritual candle next.' },
    { ...definition, id: definition.rune+'-candle', model: 'ritual-candle',
      name: (definition.rune==='watch'?'Watcher':definition.rune==='dawn'?'Dawn':'Moon')+' Candle',
      requiresOfferings: [definition.id],
      clue: 'Both relics found — return to '+level.shrines.find(item=>item.id===definition.rune).placeName+' to complete the ritual.' },
  ])
  const offerings = sequence.map(definition => {
    const shrine = level.shrines.find(item => item.id === definition.rune)
    const cells = [...reachableCells(level, level.start, definition.requiresDoors)]
      .map(id => id.split(',').map(Number))
      .filter(cell => !used.has(cell.join(',')) && level.originalGrid[cell[0] - level.mapOffset]?.[cell[1] - level.mapOffset] === 0)
      .sort((a, b) => (Math.abs(b[0] - shrine.cell[0]) + Math.abs(b[1] - shrine.cell[1]))
        - (Math.abs(a[0] - shrine.cell[0]) + Math.abs(a[1] - shrine.cell[1])))
    if (!cells.length) throw new Error(`No offering location in ${level.name}`)
    used.add(cells[0].join(','))
    const nearest = [...landmarks].sort((a,b) =>
      Math.abs(a.cell[0]-cells[0][0])+Math.abs(a.cell[1]-cells[0][1])
      - Math.abs(b.cell[0]-cells[0][0])-Math.abs(b.cell[1]-cells[0][1]))[0]
    const path = findPath(level, level.start, cells[0], definition.requiresDoors)
    const approach = path[path.length-2] || level.start
    const rotation = Math.atan2(approach[1]-cells[0][1], approach[0]-cells[0][0])
    return { ...definition, cell: cells[0], hint: nearest.name.toLowerCase(), rotation }
  })
  return { ...level, offerings, shrines: level.shrines.map(shrine => ({ ...shrine,
    requiresOfferings: offerings.filter(item => item.rune === shrine.id).map(item=>item.id) })) }
}
