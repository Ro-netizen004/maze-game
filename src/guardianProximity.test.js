import test from 'node:test'
import assert from 'node:assert/strict'
import { guardianProximityBand } from './guardianProximity.js'

test('guardian audio starts nearby, grows with proximity and avoids threshold chatter',()=>{
  assert.equal(guardianProximityBand(7),0)
  assert.ok(guardianProximityBand(6)>0)
  assert.ok(guardianProximityBand(2)>guardianProximityBand(5))
  assert.ok(guardianProximityBand(6.5,3)>0)
  assert.equal(guardianProximityBand(8,3),0)
  assert.equal(guardianProximityBand(NaN),0)
  assert.equal(guardianProximityBand(0),10)
})
