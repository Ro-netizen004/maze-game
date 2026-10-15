import test from 'node:test'
import assert from 'node:assert/strict'
import { coopMap } from './multiplayer/coopMap.js'
import { availableRelics, carriedRelics, ritualInteraction, CARRY_LIMIT } from './multiplayer/coopQuest.js'
import { createRoom,joinRoom,startRoom,applyAction,leaveRoom,tickRoom,roomSnapshot } from '../server/rooms.js'
import { cellPosition,levelTemplates } from './levels.js'
import { reachableCells,isLevelSolvable,canOpenDoor } from './levelRuntime.js'

function setup(){const r=createRoom('a','Alex',{levelIndex:2});joinRoom(r,'b','Blair');startRoom(r,'a');return r}
function at(room,id,cell){const p=room.players.get(id);[p.x,p.z]=cellPosition(room.level,cell);return p}
function pickup(room,actor,item){at(room,actor,room.quest.droppedOfferings[item.id]||item.cell);return applyAction(room,actor,{type:'offering',id:item.id})}

test('single larger co-op layout has four separated reachable clearings, loops and dead ends',()=>{
  assert.ok(coopMap.grid.length*coopMap.grid[0].length>3*Math.max(...levelTemplates.map(l=>l.grid.length*l.grid[0].length)))
  assert.equal(coopMap.shrines.length,4);assert.equal(coopMap.offerings.length,16)
  assert.equal(coopMap.offerings.find(o=>o.name==='Golden Eye').model,'golden-eye')
  assert.equal(coopMap.offerings.find(o=>o.name==='Watcher’s Eye').model,'watcher-eye')
  for(const [name,model] of [['Eclipse Ember','eclipse-ember'],['Watcher Ember','watcher-ember'],['Silver Ember','silver-ember']])
    assert.equal(coopMap.offerings.find(o=>o.name===name).model,model)
  assert.equal(new Set(coopMap.offerings.filter(o=>o.model==='moon-tear').map(o=>o.liquidColor)).size,4)
  assert.equal(new Set(coopMap.offerings.map(o=>o.cell.join(','))).size,16)
  const reachable=reachableCells(coopMap)
  for(const item of [...coopMap.shrines,...coopMap.offerings,...coopMap.hidingSpots])assert.ok(reachable.has(item.cell.join(',')))
  for(const a of coopMap.shrines)for(const b of coopMap.shrines)if(a!==b)assert.ok(Math.hypot(a.cell[0]-b.cell[0],a.cell[1]-b.cell[1])>=26)
  let edges=0,leaves=0
  for(const id of reachable){const [r,c]=id.split(',').map(Number);const n=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(p=>reachable.has(p.join(','))).length;edges+=n;if(n===1)leaves++}
  assert.ok(edges/2>reachable.size-1);assert.ok(leaves>10)
  assert.ok(isLevelSolvable(coopMap))
  assert.ok(coopMap.hidingSpots.some(s=>s.id==='entrance-hide'))
  assert.equal(setup().level.id,coopMap.id)
})

test('two personal slots, simultaneous pickups, separate deposits and four-rune progression',()=>{
  const room=setup(),q=room.quest
  assert.equal(availableRelics(room.level,q).length,4)
  for(const shrine of room.level.shrines){
    const batch=room.level.offerings.filter(o=>o.rune===shrine.id)
    assert.equal(pickup(room,'a',batch[0]),true)
    assert.equal(pickup(room,'b',batch[0]),false)
    assert.equal(pickup(room,'a',batch[1]),true)
    assert.equal(pickup(room,'a',batch[2]),false)
    assert.equal(carriedRelics(room.level,q,'a').length,CARRY_LIMIT)
    assert.equal(pickup(room,'b',batch[2]),true);assert.equal(pickup(room,'b',batch[3]),true)
    at(room,'a',shrine.cell)
    assert.equal(applyAction(room,'a',{type:'shrine',id:shrine.id}),false,'carrying is not depositing')
    assert.equal(ritualInteraction(room.level,q,'a',shrine).type,'deposit')
    assert.equal(applyAction(room,'a',{type:'deposit',id:shrine.id}),true)
    assert.equal(carriedRelics(room.level,q,'a').length,0)
    assert.equal(applyAction(room,'a',{type:'shrine',id:shrine.id}),false)
    at(room,'b',shrine.cell);assert.equal(applyAction(room,'b',{type:'deposit',id:shrine.id}),true)
    assert.equal(applyAction(room,'a',{type:'shrine',id:shrine.id}),true)
    assert.equal(applyAction(room,'b',{type:'deposit',id:shrine.id}),false)
  }
  assert.equal(q.depositedOfferings.length,16)
  assert.equal(canOpenDoor(room.level,room.level.doors[0],[],[],q.activatedShrines),true)
  assert.equal(canOpenDoor(room.level,room.level.doors[0],[],[],q.activatedShrines.slice(0,3)),false)
})

test('drop, disconnect, catch and respawn preserve recoverable relics and deposited progress',()=>{
  const room=setup(),q=room.quest,items=room.level.offerings.slice(0,4)
  assert.equal(pickup(room,'a',items[0]),true)
  assert.equal(applyAction(room,'a',{type:'drop',id:items[0].id}),true)
  assert.equal(pickup(room,'b',items[0]),true)
  const cell=[...q.droppedOfferings[items[0].id]||items[0].cell]
  leaveRoom(room,'b')
  assert.deepEqual(q.droppedOfferings[items[0].id],cell)
  assert.equal(pickup(room,'a',items[0]),true)
  at(room,'a',room.level.shrines[0].cell)
  assert.equal(applyAction(room,'a',{type:'deposit',id:'dawn'}),true)
  assert.equal(pickup(room,'a',items[1]),true)
  const p=room.players.get('a');p.x=room.guardian.x;p.z=room.guardian.z
  tickRoom(room,0.1)
  assert.equal(p.downed,true);assert.equal(carriedRelics(room.level,q,'a').length,0)
  assert.ok(q.droppedOfferings[items[1].id]);assert.deepEqual(q.depositedOfferings,[items[0].id])
  assert.equal(applyAction(room,'a',{type:'respawn'}),false)
  for(let i=0;i<151;i++)tickRoom(room,0.1)
  assert.equal(applyAction(room,'a',{type:'respawn'}),true)
  assert.equal(p.life,1);assert.equal(p.hidden,false);assert.equal(p.flashlightOn,false)
  assert.deepEqual([p.x,p.z],cellPosition(room.level,room.level.start))
  assert.equal(pickup(room,'a',items[1]),true)
  assert.equal(roomSnapshot(room).mapId,coopMap.id)
})
