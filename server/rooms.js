import { randomBytes } from 'node:crypto'
import { levelTemplates, cellPosition, doorPosition } from '../src/levels.js'
import { createSeededLevel, canOpenDoor, hasLineOfSight } from '../src/levelRuntime.js'
import { canActivateShrine, canCollectOffering } from '../src/quest/objectives.js'
import { movePlayer } from '../src/collision.js'
import { worldCell, findPath } from '../src/navigation.js'
import { createGuardianState, updateGuardianState, resolveGuardianDifficulty, guardianSpeed } from '../src/guardianAI.js'
import { flashlightHitsGuardian, guardianCanCatch } from '../src/flashlightDetection.js'
import { createBlackoutState, advanceBlackout } from '../src/blackout.js'

export const MAX_PLAYERS = 4
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z)
const emptyQuest = () => ({collectedKeys:[],collectedOfferings:[],openedDoors:[],activatedShrines:[]})

export function createRoom(ownerId, name, options = {}) {
  const id = randomBytes(3).toString('hex').toUpperCase()
  const levelIndex = Number.isInteger(options.levelIndex) && levelTemplates[options.levelIndex] ? options.levelIndex : 0
  const difficulty = ['easy','normal','hard'].includes(options.difficulty) ? options.difficulty : 'normal'
  const room = {id, ownerId, visibility:options.visibility==='public'?'public':'private',levelIndex,difficulty,
    phase:'ready',round:0,seed:`${id}:0`,players:new Map(),quest:emptyQuest(),elapsed:0,blackout:createBlackoutState()}
  initializeWorld(room)
  joinRoom(room,ownerId,name)
  return room
}

function initializeWorld(room) {
  room.level = createSeededLevel(levelTemplates[room.levelIndex],room.seed)
  const [x,z] = cellPosition(room.level,room.level.monster[0])
  room.guardian = {x,z,yaw:Math.PI,mode:'patrol',moving:false,patrol:1,waypoint:null,states:new Map()}
}

export function joinRoom(room,id,name) {
  if (room.phase!=='ready') throw new Error('This run has started. Join the next lobby.')
  if (room.players.size>=MAX_PLAYERS) throw new Error('Room is full (4 players).')
  const [x,z] = cellPosition(room.level,room.level.start)
  room.players.set(id,{id,name:String(name||'Explorer').trim().slice(0,20)||'Explorer',x,z,y:0,yaw:0,
    moving:false,sprinting:false,hidden:false,flashlightOn:true,direction:[0,0,1],downed:false,escaped:false,
    immunity:0,exposed:false,lastPose:0,noise:null})
}

export function startRoom(room,actorId) {
  if (actorId!==room.ownerId) throw new Error('Only the room host can start the run.')
  if (room.phase!=='ready' || room.players.size<2) throw new Error('At least two players must join before starting.')
  room.phase='playing'
}

export function resetRoom(room,actorId) {
  if (actorId!==room.ownerId || !['won','lost'].includes(room.phase)) throw new Error('Only the host can return a finished run to the lobby.')
  const players=[...room.players.values()]
  room.round++
  room.seed=`${room.id}:${room.round}`
  room.phase='ready'; room.elapsed=0; room.quest=emptyQuest();room.blackout=createBlackoutState()
  room.players.clear(); initializeWorld(room)
  players.forEach(player=>joinRoom(room,player.id,player.name))
}

export function leaveRoom(room,id) {
  room.players.delete(id)
  room.guardian.states.delete(id)
  if(room.ownerId===id) room.ownerId=room.players.keys().next().value||null
  finishRoom(room)
}

function finishRoom(room) {
  if(room.phase!=='playing' || !room.players.size) return
  const players=[...room.players.values()]
  if(players.every(player=>player.escaped)) room.phase='won'
  else if(players.every(player=>player.escaped||player.downed)) room.phase='lost'
}

export function updatePose(room,id,pose,now=Date.now()) {
  const player=room.players.get(id)
  if(room.phase!=='playing'||!player||player.downed||player.escaped) return
  if(!Array.isArray(pose.direction)||pose.direction.length!==3||![pose.x,pose.y,pose.z,pose.yaw,...pose.direction].every(Number.isFinite)) return
  const budget=Math.min(0.3,Math.max(0.02,(now-player.lastPose)/1000))*6.2+0.08
  const dx=pose.x-player.x,dz=pose.z-player.z,length=Math.hypot(dx,dz)
  const factor=length>budget?budget/length:1
  const steps=Math.max(1,Math.ceil(Math.min(length,budget)/0.15))
  for(let i=0;i<steps;i++) [player.x,player.z]=movePlayer(room.level,player.x,player.z,dx*factor/steps,dz*factor/steps,room.quest.openedDoors)
  player.lastPose=now
  player.y=Math.max(0,Math.min(1.2,pose.y));player.yaw=pose.yaw%(Math.PI*2)
  player.moving=Boolean(pose.moving);player.sprinting=Boolean(pose.sprinting)
  player.hidden=Boolean(pose.hidden)&&room.level.hidingSpots.some(spot=>{
    const [x,z]=cellPosition(room.level,spot.cell)
    return Math.hypot(player.x-x,player.z-z)<1.6
  })
  player.flashlightOn=Boolean(pose.flashlightOn)
  const magnitude=Math.hypot(...pose.direction)||1
  player.direction=pose.direction.map(value=>value/magnitude)
  player.noise=player.moving&&!player.hidden?{id:`${id}:${now}`,cell:worldCell(room.level,player.x,player.z),intensity:player.sprinting?5:2}:null
}

function near(room,player,cell,range=1.9) {
  const [x,z]=cellPosition(room.level,cell)
  return Math.hypot(player.x-x,player.z-z)<range
    && hasLineOfSight(room.level,worldCell(room.level,player.x,player.z),cell,room.quest.openedDoors)
}

export function applyAction(room,actorId,action) {
  const player=room.players.get(actorId),q=room.quest,level=room.level
  if(room.phase!=='playing'||!player||player.downed||player.escaped) return false
  const add=(items,id)=>{if(items.includes(id))return false;items.push(id);return true}
  if(action.type==='escape') {
    if(!q.openedDoors.includes('exit')||!near(room,player,level.end,1.3))return false
    player.escaped=true;finishRoom(room);return true
  }
  if(action.type==='revive') {
    const target=room.players.get(action.id)
    if(!target?.downed||distance(player,target)>1.9||!near(room,player,worldCell(level,target.x,target.z),2.2))return false
    target.downed=false;target.immunity=5;return true
  }
  if(player.hidden)return false
  if(action.type==='key') {
    const key=level.keys.find(item=>item.id===action.id)
    return Boolean(key&&near(room,player,key.cell)&&add(q.collectedKeys,key.id))
  }
  if(action.type==='offering') {
    const item=level.offerings.find(item=>item.id===action.id)
    return Boolean(item&&near(room,player,item.cell)&&canCollectOffering(item,q.openedDoors,q.activatedShrines,q.collectedOfferings)&&add(q.collectedOfferings,item.id))
  }
  if(action.type==='door') {
    const door=level.doors.find(item=>item.id===action.id)
    if(!door)return false
    const [x,z]=doorPosition(level,door)
    return distance(player,{x,z})<1.9&&canOpenDoor(level,door,q.collectedKeys,q.openedDoors,q.activatedShrines)&&add(q.openedDoors,door.id)
  }
  if(action.type==='shrine') {
    const shrine=level.shrines.find(item=>item.id===action.id)
    return Boolean(shrine&&near(room,player,shrine.cell,3.2)&&canActivateShrine(shrine,q.openedDoors,q.activatedShrines,q.collectedOfferings)&&add(q.activatedShrines,shrine.id))
  }
  return false
}

export function tickRoom(room,dt) {
  if(room.phase!=='playing')return
  dt=Math.min(0.1,Math.max(0,dt))
  room.elapsed+=dt*1000
  room.blackout=advanceBlackout(room.blackout,room.elapsed/1000,dt)
  const g=room.guardian,level=room.level,q=room.quest,config=resolveGuardianDifficulty(room.difficulty)
  const candidates=[]
  for(const player of room.players.values()) {
    player.immunity=Math.max(0,player.immunity-dt)
    if(player.downed||player.escaped)continue
    const exposed=flashlightHitsGuardian({level,openedDoors:q.openedDoors,playerPosition:[player.x,1.6+player.y,player.z],
      playerDirection:player.direction,guardianPosition:[g.x,g.z],flashlightOn:player.flashlightOn,range:config.flashlightRange||14})
    const previous=g.states.get(player.id)||createGuardianState()
    const ai=updateGuardianState(previous,{dt,level,openedDoors:q.openedDoors,guardianPosition:[g.x,g.z],guardianFacing:[Math.sin(g.yaw),Math.cos(g.yaw)],
      playerPosition:[player.x,player.z],playerHidden:player.hidden,flashlightExposure:exposed,noise:player.noise,config,
      targetReached:previous.targetPosition&&Math.hypot(g.x-previous.targetPosition[0],g.z-previous.targetPosition[1])<0.35})
    g.states.set(player.id,ai)
    player.exposed=Boolean(player.hidden&&ai.exposedRemaining>0&&ai.revealedShelterPosition&&Math.hypot(player.x-ai.revealedShelterPosition[0],player.z-ai.revealedShelterPosition[1])<1)
    if(player.immunity===0&&guardianCanCatch({distance:distance(g,player),sameCell:worldCell(level,g.x,g.z).join(',')===worldCell(level,player.x,player.z).join(','),
      hidden:player.hidden,flashlightExposure:exposed,exposedRemaining:ai.exposedRemaining,revealedShelterPosition:ai.revealedShelterPosition,playerPosition:[player.x,player.z]})) {
      player.downed=true;player.moving=false;player.hidden=false;continue
    }
    candidates.push({player,ai,rank:({chase:3,investigate:2,search:1,patrol:0})[ai.mode]})
  }
  candidates.sort((a,b)=>b.rank-a.rank||distance(g,a.player)-distance(g,b.player))
  const ai=candidates[0]?.ai||createGuardianState()
  if(g.mode!==ai.mode)g.waypoint=null
  g.mode=ai.mode;g.moving=false
  const target=ai.mode==='patrol'?cellPosition(level,level.monster[g.patrol]):ai.targetPosition
  if(!g.waypoint&&target) {
    const path=findPath(level,worldCell(level,g.x,g.z),worldCell(level,...target),q.openedDoors)
    g.waypoint=path.length>1?cellPosition(level,path[1]):path.length===1?target:null
    if(ai.mode==='patrol'&&path.length<=1){g.patrol=1-g.patrol;g.waypoint=null}
  }
  if(g.waypoint) {
    const dx=g.waypoint[0]-g.x,dz=g.waypoint[1]-g.z,d=Math.hypot(dx,dz)
    if(d<0.07)g.waypoint=null
    else {
      const step=Math.min(d,dt*guardianSpeed(ai,config))
      const [x,z]=movePlayer(level,g.x,g.z,dx/d*step,dz/d*step,q.openedDoors,0.75)
      g.moving=Math.hypot(x-g.x,z-g.z)>0.001;g.x=x;g.z=z;g.yaw=Math.atan2(dx,dz)
    }
  }
  finishRoom(room)
}

export function roomSnapshot(room) {
  const {id,ownerId,visibility,levelIndex,difficulty,phase,seed,round,quest,elapsed,blackout}=room
  const g=room.guardian
  return {id,ownerId,visibility,levelIndex,difficulty,phase,seed,round,quest,elapsed,blackout,
    players:[...room.players.values()].map(({id,name,x,y,z,yaw,moving,sprinting,hidden,downed,escaped,exposed,immunity})=>({id,name,x,y,z,yaw,moving,sprinting,hidden,downed,escaped,exposed,immunity})),
    guardian:{x:g.x,z:g.z,yaw:g.yaw,moving:g.moving,mode:g.mode,chasing:g.mode==='chase',attacking:false}}
}

export function publicRoomList(rooms) {
  return [...rooms.values()].filter(room=>room.visibility==='public'&&room.phase==='ready'&&room.players.size<MAX_PLAYERS)
    .map(room=>({id:room.id,levelIndex:room.levelIndex,difficulty:room.difficulty,count:room.players.size}))
}
