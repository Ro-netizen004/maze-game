import test from 'node:test'
import assert from 'node:assert/strict'
import { lightpostPower,blackoutPhase,BLACKOUT_END,createBlackoutState,advanceBlackout,blackoutPower,blackoutRemaining } from './blackout.js'
import { flashlightHitsGuardian,guardianCanCatch } from './flashlightDetection.js'
import { createGuardianState,updateGuardianState,guardianDifficultyPresets } from './guardianAI.js'
import { updateFlashlightBattery } from './flashlightBattery.js'

const level={grid:[[0,0,0],[0,0,0],[0,0,0]],doors:[]}
test('a stalled timer cannot skip the flicker or the twelve-second dark phase',()=>{
  let state=advanceBlackout(createBlackoutState(),80,40)
  assert.equal(state.phase,'flickering')
  state=advanceBlackout(state,100,20)
  assert.equal(state.phase,'flickering')
  assert.equal(blackoutPower(state),0)
  for(let i=0;i<11;i++)state=advanceBlackout(state,110,0.25)
  assert.equal(state.phase,'dark')
  assert.equal(blackoutRemaining(state),12)
  for(let i=0;i<47;i++)state=advanceBlackout(state,150,0.25)
  assert.equal(blackoutPower(state),0)
  state=advanceBlackout(state,151,0.25)
  assert.equal(state.phase,'done')
  assert.equal(blackoutPower(state),1)
  assert.equal(advanceBlackout(state,200,10),state)
  assert.equal(createBlackoutState().phase,'waiting','restarting creates a fresh event')
})
test('45-second flicker is followed by twelve seconds of darkness and restoration',()=>{
  assert.equal(lightpostPower(44.9),1)
  assert.equal(blackoutPhase(45),'flickering')
  assert.equal(lightpostPower(45.1),1)
  assert.equal(lightpostPower(45.3),0)
  assert.equal(lightpostPower(45.8),1)
  assert.equal(blackoutPhase(47.9),'flickering')
  assert.equal(lightpostPower(48),0)
  assert.equal(blackoutPhase(48),'dark')
  assert.equal(BLACKOUT_END,60)
  assert.equal(lightpostPower(BLACKOUT_END-0.01),0)
  assert.equal(lightpostPower(BLACKOUT_END),1)
  assert.equal(blackoutPhase(BLACKOUT_END),'normal')
  assert.ok(updateFlashlightBattery(100,60,true)>60,'flashlight is not depleted by the outage')
})
test('beam exposure respects aim, range, walls and closed doors',()=>{
  const input={level,playerPosition:[0,1.6,-2],playerDirection:[0,0,1],guardianPosition:[0,2],flashlightOn:true}
  assert.equal(flashlightHitsGuardian(input),true)
  assert.equal(flashlightHitsGuardian({...input,flashlightOn:false}),false)
  assert.equal(flashlightHitsGuardian({...input,playerDirection:[0,0,-1]}),false)
  assert.equal(flashlightHitsGuardian({...input,playerDirection:[0,1,0]}),false)
  assert.equal(flashlightHitsGuardian({...input,range:2}),false)
  assert.equal(flashlightHitsGuardian({...input,level:{...level,grid:[[0,0,0],[0,1,0],[0,0,0]]}}),false)
  const gated={...level,doors:[{id:'ruby',cell:[1,1]}]}
  assert.equal(flashlightHitsGuardian({...input,level:gated}),false)
  assert.equal(flashlightHitsGuardian({...input,level:gated,openedDoors:['ruby']}),true)
})
test('shining at a guardian reveals a hidden player and preserves the revealed shelter briefly',()=>{
  const input={level,guardianPosition:[0,2],guardianFacing:[0,1],playerPosition:[0,-2],playerHidden:true,flashlightExposure:true,dt:0.1}
  let state=updateGuardianState(createGuardianState(),input)
  assert.equal(state.mode,'chase')
  assert.deepEqual(state.targetPosition,[0,-2])
  state=updateGuardianState(state,{...input,flashlightExposure:false,dt:1})
  assert.equal(state.mode,'chase')
  assert.ok(state.exposedRemaining>0)
  assert.equal(guardianCanCatch({distance:0.5,sameCell:true,hidden:true,exposedRemaining:state.exposedRemaining,revealedShelterPosition:state.revealedShelterPosition,playerPosition:input.playerPosition}),true)
  assert.equal(guardianCanCatch({distance:0.5,sameCell:true,hidden:true,playerPosition:[0,-2]}),false)
  assert.equal(guardianCanCatch({distance:0.5,sameCell:true,hidden:true,exposedRemaining:3,revealedShelterPosition:[0,2],playerPosition:[0,-2]}),false)
  assert.equal(guardianCanCatch({distance:0.5,sameCell:false,flashlightExposure:true,playerPosition:[0,-2]}),false)
})

test('turning the light off before hiding does not carry walking exposure into the shelter',()=>{
  for(const config of [guardianDifficultyPresets.normal,guardianDifficultyPresets.hard]) {
    const input={level,guardianPosition:[0,2],guardianFacing:[0,1],playerPosition:[0,-2],playerHidden:false,flashlightExposure:true,dt:0.1,config}
    let state=updateGuardianState(createGuardianState(),input)
    assert.equal(state.mode,'chase')
    assert.equal(state.revealedShelterPosition,null)
    state=updateGuardianState(state,{...input,playerHidden:true,flashlightExposure:false})
    assert.equal(state.revealedShelterPosition,null)
    assert.equal(guardianCanCatch({distance:0.5,sameCell:true,hidden:true,exposedRemaining:state.exposedRemaining,revealedShelterPosition:state.revealedShelterPosition,playerPosition:input.playerPosition}),false)
  }
})

test('ordinary sightings cannot transfer a previously revealed shelter to a new hiding location',()=>{
  const input={level,guardianPosition:[0,2],guardianFacing:[0,-1],playerPosition:[0,-2],playerHidden:true,flashlightExposure:true,dt:0.1}
  let state=updateGuardianState(createGuardianState(),input)
  state=updateGuardianState(state,{...input,playerHidden:false,flashlightExposure:false,playerPosition:[0,0]})
  assert.deepEqual(state.lastKnownPosition,[0,0])
  assert.deepEqual(state.revealedShelterPosition,[0,-2])
  state=updateGuardianState(state,{...input,flashlightExposure:false,playerPosition:[0,0]})
  assert.equal(guardianCanCatch({distance:0.5,sameCell:true,hidden:true,exposedRemaining:state.exposedRemaining,revealedShelterPosition:state.revealedShelterPosition,playerPosition:[0,0]}),false)
})
test('hard guardian outruns walking and retains a stronger search',()=>{
  const hard=guardianDifficultyPresets.hard,normal=guardianDifficultyPresets.normal
  assert.ok(hard.chaseSpeed>4 && hard.chaseSpeed<6.2)
  assert.ok(hard.searchDuration>=normal.searchDuration*2)
  assert.ok(hard.hearingRange>normal.hearingRange && hard.sightRange>normal.sightRange)
})
