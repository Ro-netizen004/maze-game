import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { canOpenDoor, isLevelSolvable } from './levelRuntime.js'
import { canActivateShrine, nextObjective, shrineRequirement } from './objectives.js'

test('each ritual requires its offering and candle, and the exit waits for all rituals',()=>{
  for(const level of levels) {
    const all=level.offerings.map(item=>item.id),doors=['ruby','sapphire']
    for(const shrine of level.shrines) {
      const earlier=shrine.id==='dawn'?[]:shrine.id==='moon'?['dawn']:['dawn','moon']
      assert.equal(canActivateShrine(shrine,doors,earlier,all),true)
      for(const id of shrine.requiresOfferings) assert.equal(canActivateShrine(shrine,doors,earlier,all.filter(item=>item!==id)),false)
    }
    const exit=level.doors.find(item=>item.id==='exit')
    assert.equal(canOpenDoor(level,exit,[],doors,['dawn','moon']),false)
    assert.equal(canOpenDoor(level,exit,[],doors,['dawn','moon','watch']),true)
    assert.ok(isLevelSolvable(level))
    assert.equal(isLevelSolvable({...level,shrines:level.shrines.filter(item=>item.id!=='watch')}),false)
  }
})
test('objectives guide both relics before sending the player to each ritual',()=>{
  const level=levels[0],all=level.offerings.map(item=>item.id)
  assert.match(nextObjective(level),/Ruby key/)
  assert.match(nextObjective(level,['ruby'],['ruby']),/Find the Sun Ember/)
  assert.match(nextObjective(level,['ruby'],['ruby'],[],['sun-ember']),/Dawn Candle/)
  assert.match(nextObjective(level,['ruby'],['ruby'],[],['sun-ember','dawn-candle']),/Offer the Sun Ember and Dawn Candle/)
  assert.match(nextObjective(level,['ruby','sapphire'],['ruby','sapphire'],['dawn','moon','watch'],all),/open the exit/)
  assert.match(shrineRequirement(level,level.shrines[0],['ruby'],[],['sun-ember']),/Dawn Candle/)
})
