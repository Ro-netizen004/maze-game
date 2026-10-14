import test from 'node:test'
import assert from 'node:assert/strict'
import { levels,cellPosition,canOpenDoor } from './levels.js'
import { reachableCells,isLevelSolvable } from './levelRuntime.js'
import { lightpostLayout } from './mazeLighting.js'

test('three rune gardens attach without changing any original interior corridor',()=>{
  for(const level of levels){
    assert.equal(level.clearings.length,3)
    assert.equal(level.shrines.length,3)
    const offset=level.mapOffset, old=level.originalGrid
    for(let r=1;r<old.length-1;r++)for(let c=1;c<old[r].length-1;c++) {
      if(level.hedgePockets.some(({cell})=>cell[0]===r+offset && cell[1]===c+offset)) continue
      assert.equal(level.grid[r+offset][c+offset],old[r][c])
    }
    const accessible=reachableCells(level,level.start,level.doors.map(d=>d.id))
    for(const clearing of level.clearings){
      assert.ok(accessible.has(clearing.cell.join(',')))
      assert.ok(accessible.has(clearing.entrance.join(',')))
      for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)assert.equal(level.grid[clearing.cell[0]+dr][clearing.cell[1]+dc],0)
      const [x,z]=cellPosition(level,clearing.cell)
      assert.ok(Math.abs(x)+clearing.radius<level.grid[0].length && Math.abs(z)+clearing.radius<level.grid.length)
    }
    assert.ok(isLevelSolvable(level))
    assert.equal(canOpenDoor(level,level.doors.find(d=>d.id==='exit'),[],[]),false)
    assert.equal(canOpenDoor(level,level.doors.find(d=>d.id==='exit'),level.keys.map(k=>k.id),level.mechanics.requiredDoors),true)
  }
})

test('extra lightposts cover paths and every rune garden without filling passages',()=>{
  for(const level of levels){
    const desktop=lightpostLayout(level), mobile=lightpostLayout(level,true)
    assert.ok(desktop.length>=12,'more posts than the old five-post limit')
    assert.ok(mobile.length>=8 && mobile.length<=desktop.length)
    assert.equal(desktop.filter(p=>p.garden).length,6)
    for(const fixture of desktop.filter(p=>!p.garden)){
      assert.equal(level.grid[fixture.cell[0]][fixture.cell[1]],0)
      const [x,z]=cellPosition(level,fixture.cell)
      assert.ok(Math.hypot(x-fixture.position[0],z-fixture.position[2])>0.7,'posts sit near edges, leaving the center free')
    }
  }
})
