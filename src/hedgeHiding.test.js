import test from 'node:test'
import assert from 'node:assert/strict'
import { levels,cellPosition } from './levels.js'
import { reachableCells,isLevelSolvable } from './levelRuntime.js'
import { movePlayer } from './collision.js'
import { normalizeProgress } from './persistence.js'
import { graphicsPreset } from './graphics.js'

test('30 percent of eligible hedge recesses become reachable, collision-free leaf pockets',()=>{
  for(const level of levels) {
    assert.ok(level.hedgeGapCount>0)
    assert.equal(level.hedgePockets.filter(p=>p.id!=='entrance-hide').length,Math.round(level.hedgeGapCount*0.3))
    assert.ok(level.hedgePockets.some(p=>p.id==='entrance-hide'))
    assert.equal(Math.abs(level.entranceHidingSpot.entryCell[0]-level.start[0])+Math.abs(level.entranceHidingSpot.entryCell[1]-level.start[1]),1)
    const reachable=reachableCells(level,level.start,level.doors.map(d=>d.id))
    for(const pocket of level.hedgePockets) {
      const [r,c]=pocket.cell
      assert.equal(level.grid[r][c],0)
      assert.equal([[-1,0],[1,0],[0,-1],[0,1]].filter(([dr,dc])=>level.grid[r+dr][c+dc]===0).length,1)
      assert.ok(reachable.has(pocket.cell.join(',')))
      const [x,z]=cellPosition(level,pocket.entryCell),[px,pz]=cellPosition(level,pocket.cell)
      let position=[x,z]
      for(let i=0;i<20;i++)position=movePlayer(level,...position,(px-x)/20,(pz-z)/20,level.doors.map(d=>d.id))
      assert.ok(Math.hypot(position[0]-px,position[1]-pz)<0.01)
    }
    assert.ok(isLevelSolvable(level))
  }
})

test('audio and graphics preferences normalize safely and performance reduces the render budget',()=>{
  const result=normalizeProgress({version:1,settings:{graphicsQuality:'invalid',ambienceVolume:999,ambienceEnabled:false}})
  assert.equal(result.settings.graphicsQuality,'balanced')
  assert.equal(result.settings.ambienceVolume,100)
  assert.equal(result.settings.ambienceEnabled,false)
  assert.equal(graphicsPreset('performance').shadows,false)
  assert.ok(graphicsPreset('high').dpr>graphicsPreset('performance').dpr)
})
