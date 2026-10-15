import { lazy, Suspense, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import PlayerAvatar from '../PlayerAvatar.jsx'
import DeepSeaMonster from '../DeepSeaMonster.jsx'
import MonsterAssetBoundary from '../MonsterAssetBoundary.jsx'
import { guardianProximityBand } from '../guardianProximity.js'

const AnimatedMonster=lazy(()=>import('../AnimatedMonster.jsx'))

function Teammate({ player, color }) {
  const pose=useRef({...player})
  useFrame((_,delta)=>{
    const factor=1-Math.exp(-Math.min(delta,0.1)*18)
    pose.current.x+=(player.x-pose.current.x)*factor
    pose.current.y+=(player.y-pose.current.y)*factor
    pose.current.z+=(player.z-pose.current.z)*factor
    pose.current.yaw=player.yaw;pose.current.moving=player.moving&&!player.downed;pose.current.sprinting=player.sprinting
  })
  return <PlayerAvatar pose={pose} shirt={player.downed?'#a34c4c':color} />
}

function SharedGuardian({ guardian }) {
  const body=useRef(null),ai=useRef({moving:false,chasing:false,attacking:false})
  const [spawn]=useState(()=>[guardian.x,0,guardian.z])
  useFrame((_,delta)=>{
    if(!body.current)return
    const factor=1-Math.exp(-Math.min(delta,0.1)*18)
    body.current.position.x+=(guardian.x-body.current.position.x)*factor
    body.current.position.z+=(guardian.z-body.current.position.z)*factor
    body.current.rotation.y=guardian.yaw
    ai.current.moving=guardian.moving;ai.current.chasing=guardian.chasing
  })
  return <group ref={body} position={spawn}>
    <MonsterAssetBoundary fallback={<DeepSeaMonster ai={ai} active />}><Suspense fallback={<DeepSeaMonster ai={ai} active />}><AnimatedMonster ai={ai} active /></Suspense></MonsterAssetBoundary>
  </group>
}

export default function MultiplayerWorld({ multiplayer, hidden, flashlightOn, onProximityChange, playerPose, paused }) {
  const {camera}=useThree(),direction=useRef(new Vector3()),timer=useRef(0),band=useRef(0)
  const {room,id,send}=multiplayer
  const player=room.players.find(player=>player.id===id)
  useFrame((_,delta)=>{
    if(room.phase!=='playing')return
    timer.current+=delta
    if(timer.current<0.1)return
    timer.current=0
    if(player && !player.downed&&!player.escaped) {
      // Reconcile rejected movement without fighting ordinary network interpolation.
      if(Math.hypot(camera.position.x-player.x,camera.position.z-player.z)>2)camera.position.set(player.x,1.6+player.y,player.z)
      camera.getWorldDirection(direction.current)
      send({type:'pose',pose:{x:camera.position.x,y:camera.position.y-1.6,z:camera.position.z,yaw:Math.atan2(direction.current.x,direction.current.z),
        moving:!paused&&Boolean(playerPose.current?.moving),sprinting:!paused&&Boolean(playerPose.current?.sprinting),hidden:Boolean(playerPose.current?.hidden ?? hidden),flashlightOn,direction:direction.current.toArray()}})
    }
    const proximity=guardianProximityBand(Math.hypot(camera.position.x-room.guardian.x,camera.position.z-room.guardian.z),band.current)
    if(proximity!==band.current){band.current=proximity;onProximityChange(proximity)}
  })
  return <group>
    {room.players.filter(player=>player.id!==id&&!player.escaped).map((player,index)=><Teammate key={player.id} player={player} color={['#668bc0','#bba35d','#8669a6'][index%3]} />)}
    <SharedGuardian guardian={room.guardian} />
  </group>
}
