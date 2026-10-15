import test from 'node:test'
import assert from 'node:assert/strict'
import { levels, cellPosition } from './levels.js'
import { reachableCells } from './levelRuntime.js'
import { findPath } from './navigation.js'
import { movePlayer } from './collision.js'
import { lightpostLayout } from './mazeLighting.js'

const id = cell => cell.join(',')
const directions = [[-1,0],[1,0],[0,-1],[0,1]]

test('each maze gains four genuine loops, including two expanded outer trails', () => {
  for (const level of levels) {
    assert.equal(level.escapeRoutes.length,4)
    assert.equal(level.mapOffset,5)
    const opened = level.doors.map(door=>door.id)
    const reachable = reachableCells(level,level.start,opened)
    for (const route of level.escapeRoutes) {
      assert.ok(route.cells.every(cell=>reachable.has(id(cell))),`${level.name}: ${route.id} must be reachable`)
      const removed = new Set(route.cells.slice(1,-1).map(id))
      const withoutRoute = {...level,grid:level.grid.map((row,r)=>row.map((cell,c)=>removed.has(`${r},${c}`)?1:cell))}
      assert.ok(findPath(withoutRoute,...route.endpoints,opened).length>0,`${route.id} must reconnect to an alternative path`)
    }
    assert.ok(level.escapeRoutes.find(route=>route.id==='west-flank').cells.some(cell=>cell[1]<level.mapOffset))
    const posts=lightpostLayout(level)
    assert.ok(posts.some(post=>post.route==='west-flank'))
    assert.ok(posts.some(post=>post.route==='moonwell-return'))
    const moon=level.clearings.find(clearing=>clearing.id==='moon')
    // Block the old garden entrance: the return trail still leads to Moonwell.
    const [r,c]=moon.entrance
    const blocked={...level,grid:level.grid.map(row=>[...row])}
    blocked.grid[r-1][c]=1
    assert.ok(reachableCells(blocked,level.start,opened).has(id(moon.cell)))
  }
})

test('outer branches remain dead ends and the Ruby gate still protects every Sapphire spawn', () => {
  for (const level of levels) {
    const pockets=new Set(level.hedgePockets.map(pocket=>id(pocket.cell)))
    for(const branch of level.deadEndBranches) {
      const [r,c]=branch.cells.at(-1)
      const neighbors=directions.map(([dr,dc])=>[r+dr,c+dc])
        .filter(cell=>level.grid[cell[0]]?.[cell[1]]===0&&!pockets.has(id(cell)))
      assert.equal(neighbors.length,1)
    }
    const locked=reachableCells(level,level.start,[])
    const rubyOpen=reachableCells(level,level.start,['ruby'])
    for(const cell of level.keySpawnPools.sapphire) {
      assert.equal(locked.has(id(cell)),false)
      assert.ok(rubyOpen.has(id(cell)))
    }
    assert.equal(reachableCells(level,level.start,['ruby','sapphire']).has(id(level.end)),false)
  }
})

test('players and the full-size guardian can physically traverse every new route', () => {
  for(const level of levels)for(const route of level.escapeRoutes)for(const radius of [0.3,0.75]) {
    const opened=level.doors.map(door=>door.id)
    let position=cellPosition(level,route.cells[0])
    for(const cell of route.cells.slice(1)) {
      const target=cellPosition(level,cell)
      const dx=(target[0]-position[0])/20,dz=(target[1]-position[1])/20
      for(let step=0;step<20;step++)position=movePlayer(level,...position,dx,dz,opened,radius)
      assert.ok(Math.hypot(position[0]-target[0],position[1]-target[1])<0.01,`${level.name} ${route.id} radius ${radius}`)
    }
  }
})
