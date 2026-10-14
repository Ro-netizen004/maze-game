import fs from 'node:fs'
import { levels } from '../../src/game/world/levels.js'
import { reachableCells } from '../../src/game/world/levelRuntime.js'
const level = levels[0], reachable = reachableCells(level)
console.log('Reachable', reachable.size, 'walls', level.grid.flat().filter(Boolean).length)
for (const site of [level.start, level.end, ...level.clues.map(x => x.cell), ...level.rituals.map(x => x.cell), ...level.monster, ...level.hidingSpots.map(x => x.cell)]) {
  if (!reachable.has(site.join(','))) throw new Error('Unreachable site: ' + site)
}
fs.mkdirSync('docs/layout', { recursive: true })
fs.writeFileSync('docs/layout/forest-layout.json', JSON.stringify({grid:level.grid,start:level.start,end:level.end,journals:level.clues.map(({name,cell,color})=>({name,cell,color})),rituals:level.rituals.map(({cell,color})=>({cell,color}))},null,2))
