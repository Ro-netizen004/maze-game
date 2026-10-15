import test from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import WebSocket from 'ws'
import { createRoom,joinRoom,startRoom,leaveRoom,applyAction,tickRoom,updatePose,publicRoomList,resetRoom,roomSnapshot } from '../server/rooms.js'
import { createMultiplayerServer } from '../server/index.js'
import { cellPosition } from './levels.js'

test('private rooms stay out of matchmaking, capacity/host controls and disconnect transfer work',()=>{
  const room=createRoom('host','Host',{visibility:'private'})
  assert.deepEqual(publicRoomList(new Map([[room.id,room]])),[])
  assert.throws(()=>startRoom(room,'host'),/two players/)
  joinRoom(room,'guest','Guest');joinRoom(room,'third','Third');joinRoom(room,'fourth','Fourth')
  assert.throws(()=>joinRoom(room,'fifth','Fifth'),/full/)
  assert.throws(()=>startRoom(room,'guest'),/host/)
  leaveRoom(room,'host');assert.equal(room.ownerId,'guest')
  startRoom(room,'guest');assert.equal(room.phase,'playing')
  assert.throws(()=>joinRoom(room,'late','Late'),/started/)
  room.phase='lost';resetRoom(room,'guest')
  assert.equal(room.phase,'ready');assert.equal(room.players.size,3);assert.equal(room.round,1)
})

test('shared progression is validated and cannot collect through locked ritual stages or from far away',()=>{
  const room=createRoom('host','Host');joinRoom(room,'guest','Guest');startRoom(room,'host')
  const player=room.players.get('guest')
  const key=room.level.keys[0]
  assert.equal(applyAction(room,'guest',{type:'key',id:key.id}),false)
  const [x,z]=cellPosition(room.level,key.cell);player.x=x;player.z=z
  assert.equal(applyAction(room,'guest',{type:'key',id:key.id}),true)
  assert.equal(applyAction(room,'host',{type:'key',id:key.id}),false)
  assert.deepEqual(room.quest.collectedKeys,[key.id])
  const eye=room.level.offerings.find(item=>item.id==='watcher-eye')
  ;[player.x,player.z]=cellPosition(room.level,eye.cell)
  assert.equal(applyAction(room,'guest',{type:'offering',id:eye.id}),false)
  assert.equal(applyAction(room,'guest',{type:'shrine',id:'watch'}),false)
  updatePose(room,'guest',{x:999,z:999,y:0,yaw:0,direction:[0,0,1]},1000)
  assert.ok(Math.abs(player.x)<100&&Math.abs(player.z)<100)
})

test('caught teammates can be revived, and escape waits for everyone connected',()=>{
  const room=createRoom('host','Host');joinRoom(room,'guest','Guest');startRoom(room,'host')
  const host=room.players.get('host'),guest=room.players.get('guest')
  guest.downed=true
  assert.equal(applyAction(room,'host',{type:'revive',id:'guest'}),true)
  assert.equal(guest.downed,false);assert.equal(guest.immunity,5)
  room.quest.openedDoors.push('ruby','sapphire','exit')
  ;[host.x,host.z]=cellPosition(room.level,room.level.end)
  assert.equal(applyAction(room,'host',{type:'escape'}),true)
  assert.equal(room.phase,'playing')
  ;[guest.x,guest.z]=cellPosition(room.level,room.level.end)
  assert.equal(applyAction(room,'guest',{type:'escape'}),true)
  assert.equal(room.phase,'won')
})

test('guardian targets players on the server, shares a blackout, and catches the group consistently',()=>{
  const room=createRoom('host','Host');joinRoom(room,'guest','Guest');startRoom(room,'host')
  for(const player of room.players.values()) {player.x=room.guardian.x;player.z=room.guardian.z}
  tickRoom(room,0.1)
  assert.ok([...room.players.values()].every(player=>player.downed))
  assert.equal(room.phase,'lost')
  resetRoom(room,'host');startRoom(room,'host')
  room.elapsed=45000;tickRoom(room,0.1)
  assert.equal(roomSnapshot(room).blackout.phase,'flickering')
})

function client(url) {
  const socket=new WebSocket(url),messages=[],waiters=new Set()
  socket.on('message',bytes=>{const message=JSON.parse(bytes);messages.push(message);for(const check of waiters)check()})
  return {socket,messages,send:message=>socket.send(JSON.stringify(message)),wait:predicate=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{waiters.delete(check);reject(new Error('Timed out waiting for a server message'))},4000)
    const check=()=>{const message=messages.find(predicate);if(message){clearTimeout(timer);waiters.delete(check);resolve(message)}}
    waiters.add(check);check()
  })}
}

test('two real WebSocket clients can quick-join, start, share a collectible and transfer host',async()=>{
  const multiplayer=createMultiplayerServer({port:0})
  await once(multiplayer.server,'listening')
  const url=`ws://127.0.0.1:${multiplayer.server.address().port}`
  const first=client(url),second=client(url)
  try {
    const firstWelcome=await first.wait(message=>message.type==='welcome')
    const secondWelcome=await second.wait(message=>message.type==='welcome')
    first.send({type:'quickJoin',name:'Host',levelIndex:0,difficulty:'normal'})
    const created=await first.wait(message=>message.type==='room')
    second.send({type:'list'})
    const listing=await second.wait(message=>message.type==='rooms')
    assert.equal(listing.rooms[0].id,created.room.id)
    second.send({type:'quickJoin',name:'Guest',levelIndex:0,difficulty:'normal'})
    const joined=await second.wait(message=>message.type==='room'&&message.room.players.length===2)
    assert.equal(joined.room.id,created.room.id)
    second.send({type:'start'})
    await second.wait(message=>message.type==='error'&&/host/.test(message.message))
    first.send({type:'start'})
    await second.wait(message=>message.type==='room'&&message.room.phase==='playing')
    const room=multiplayer.rooms.get(created.room.id),key=room.level.keys[0]
    const player=room.players.get(secondWelcome.id)
    ;[player.x,player.z]=cellPosition(room.level,key.cell)
    second.send({type:'action',action:{type:'key',id:key.id}})
    const synced=await first.wait(message=>message.type==='room'&&message.room.quest.collectedKeys.includes(key.id))
    assert.equal(synced.room.seed,joined.room.seed)
    first.send({type:'leave'})
    await second.wait(message=>message.type==='room'&&message.room.ownerId===secondWelcome.id)
    assert.notEqual(firstWelcome.id,secondWelcome.id)
  } finally {first.socket.close();second.socket.close();await multiplayer.close()}
})
