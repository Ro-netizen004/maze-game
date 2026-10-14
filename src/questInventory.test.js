import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { carriedQuestItems, depositedOfferings } from './questInventory.js'
import { visibleOfferings, nextObjective } from './objectives.js'

test('only carried items appear; opened seals consume keys without losing collection history',()=>{
  const level=levels[0]
  assert.deepEqual(carriedQuestItems(level),[])
  assert.deepEqual(carriedQuestItems(level,['ruby']).map(item=>item.name),['Ruby key'])
  assert.deepEqual(carriedQuestItems(level,['ruby'],['ruby']),[])
  assert.deepEqual(carriedQuestItems(level,['ruby','sapphire'],['ruby'],['sun-ember','dawn-candle']).map(item=>item.name),['Sapphire key','Sun Ember','Dawn Candle'])
})

test('activating each ritual deposits both models and empties carried inventory without respawns',()=>{
  for(const level of levels) {
    const history=[],lit=[],doors=['ruby','sapphire']
    for(const shrine of level.shrines) {
      history.push(...shrine.requiresOfferings)
      assert.deepEqual(carriedQuestItems(level,[],doors,history,lit).map(item=>item.id),shrine.requiresOfferings)
      lit.push(shrine.id)
      assert.deepEqual(carriedQuestItems(level,[],doors,history,lit),[])
      const placed=depositedOfferings(level,lit).filter(item=>item.rune===shrine.id)
      assert.deepEqual(placed.map(item=>item.id),shrine.requiresOfferings)
      assert.ok(placed.some(item=>item.model==='ritual-candle'))
      assert.equal(visibleOfferings(level,doors,lit,history).some(item=>history.includes(item.id)),false)
    }
    assert.equal(depositedOfferings(level,lit).length,6)
    assert.match(nextObjective(level,['ruby','sapphire'],doors,lit,history),/open the exit/)
    assert.deepEqual(depositedOfferings(level),[])
  }
})
