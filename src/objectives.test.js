import test from 'node:test'
import assert from 'node:assert/strict'
import { levels } from './levels.js'
import { canOpenDoor,isLevelSolvable } from './levelRuntime.js'
import { canActivateShrine,nextObjective,shrineRequirement } from './objectives.js'

test('seals awaken runes, Dawn and Moon power Watcher, and the completed ritual unlocks escape',()=>{
  for(const level of levels) {
    const [dawn,moon,watch]=level.shrines,exit=level.doors.find(d=>d.id==='exit')
    assert.equal(canActivateShrine(dawn),false)
    assert.equal(canActivateShrine(dawn,['ruby']),true)
    assert.equal(canActivateShrine(moon,['ruby']),false)
    assert.equal(canActivateShrine(moon,['ruby','sapphire']),true)
    assert.equal(canActivateShrine(watch,['ruby','sapphire'],['dawn']),false)
    assert.equal(canActivateShrine(watch,['ruby','sapphire'],['dawn','moon']),true)
    assert.equal(canOpenDoor(level,exit,['ruby','sapphire'],['ruby','sapphire'],['dawn','moon']),false)
    assert.equal(canOpenDoor(level,exit,['ruby','sapphire'],['ruby','sapphire'],['dawn','moon','watch']),true)
    assert.equal(canOpenDoor(level,exit,['ruby','sapphire'],['ruby'],['dawn','moon','watch']),false)
    assert.ok(isLevelSolvable(level))
    // A missing ritual site makes the exit impossible, rather than silently optional.
    assert.equal(isLevelSolvable({...level,shrines:level.shrines.filter(s=>s.id!=='watch')}),false)
  }
})

test('HUD and locked rune prompts explain the next linked objective',()=>{
  const level=levels[0]
  assert.match(nextObjective(level),/Find the Ruby key/)
  assert.match(nextObjective(level,['ruby']),/Open the Ruby seal/)
  assert.match(nextObjective(level,['ruby'],['ruby']),/Light Dawn/)
  assert.match(nextObjective(level,['ruby'],['ruby'],['dawn']),/Find the Sapphire key/)
  assert.match(nextObjective(level,['ruby','sapphire'],['ruby','sapphire'],['dawn','moon']),/Watcher/)
  assert.match(nextObjective(level,['ruby','sapphire'],['ruby','sapphire'],['dawn','moon','watch']),/open the exit/)
  assert.match(shrineRequirement(level,level.shrines[0]),/Ruby seal/)
  assert.match(shrineRequirement(level,level.shrines[2],['ruby','sapphire'],['dawn']),/Moon rune/)
})
