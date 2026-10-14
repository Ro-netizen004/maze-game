import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { isLevelSolvable, reachableCells } from './levelRuntime.js'
import { visibleOfferings } from './objectives.js'

test('only the next relic is visible, even if both seals are opened early',()=>{
  for(const level of levels) {
    const doors=['ruby','sapphire'],owned=[],lit=[]
    assert.deepEqual(visibleOfferings(level).map(item=>item.id),[])
    for(const [relic,candle,rune] of [['sun-ember','dawn-candle','dawn'],['moon-tear','moon-candle','moon'],['watcher-eye','watch-candle','watch']]) {
      assert.deepEqual(visibleOfferings(level,doors,lit,owned).map(item=>item.id),[relic])
      owned.push(relic)
      assert.deepEqual(visibleOfferings(level,doors,lit,owned).map(item=>item.id),[candle])
      owned.push(candle)
      assert.deepEqual(visibleOfferings(level,doors,lit,owned),[])
      lit.push(rune)
    }
    assert.deepEqual(visibleOfferings(level,doors,lit,owned),[])
    // A new run has no visible relics before the first seal.
    assert.deepEqual(visibleOfferings(level),[])
  }
})
test('all six relics occupy distinct reachable cells and each is required for escape',()=>{
  for(const level of levels) {
    assert.equal(level.offerings.length,6)
    assert.equal(new Set(level.offerings.map(item=>item.cell.join(','))).size,6)
    for(const offering of level.offerings) {
      assert.ok(reachableCells(level,level.start,offering.requiresDoors).has(offering.cell.join(',')))
      assert.equal(isLevelSolvable({...level,offerings:level.offerings.filter(item=>item.id!==offering.id)}),false)
    }
  }
})
