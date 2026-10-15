import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import process from 'node:process'
import { WebSocketServer, WebSocket } from 'ws'
import { createRoom, joinRoom, startRoom, resetRoom, leaveRoom, updatePose, applyAction, tickRoom, roomSnapshot, publicRoomList } from './rooms.js'

export function createMultiplayerServer({port=8787,host='127.0.0.1',allowedOrigins=[]}={}) {
  const rooms=new Map(),clients=new Map()
  const server=createServer((request,response)=>{
    response.writeHead(request.url==='/health'?200:404,{'Content-Type':'application/json'})
    response.end(JSON.stringify({ok:request.url==='/health',rooms:rooms.size}))
  })
  const wss=new WebSocketServer({server,maxPayload:4096,perMessageDeflate:false,
    verifyClient:({origin})=>!allowedOrigins.length||allowedOrigins.includes(origin)})
  const send=(socket,message)=>{if(socket.readyState===WebSocket.OPEN&&socket.bufferedAmount<64*1024)socket.send(JSON.stringify(message))}
  function broadcastRoom(room) {
    const state=roomSnapshot(room)
    for(const id of room.players.keys()) {
      const client=clients.get(id)
      if(client)send(client.socket,{type:'room',room:state})
    }
  }
  function leave(client) {
    const room=rooms.get(client.roomId)
    client.roomId=null
    if(!room)return
    leaveRoom(room,client.id)
    if(!room.players.size)rooms.delete(room.id)
    else broadcastRoom(room)
  }
  wss.on('connection',socket=>{
    const client={id:randomUUID(),socket,roomId:null,alive:true,window:Date.now(),messages:0}
    clients.set(client.id,client)
    send(socket,{type:'welcome',id:client.id})
    socket.on('pong',()=>{client.alive=true})
    socket.on('error',()=>{})
    socket.on('message',bytes=>{
      if(Date.now()-client.window>1000){client.window=Date.now();client.messages=0}
      if(++client.messages>60){socket.close(1008,'Message rate exceeded');return}
      try {
        const message=JSON.parse(bytes.toString())
        if(!message||typeof message!=='object')return
        let room=rooms.get(client.roomId)
        if(message.type==='list'){send(socket,{type:'rooms',rooms:publicRoomList(rooms)});return}
        if(message.type==='leave'){leave(client);send(socket,{type:'left'});return}
        if(['create','join','quickJoin'].includes(message.type)) {
          if(room)throw new Error('Leave your current room first.')
          if(message.type==='quickJoin') {
            room=[...rooms.values()].find(item=>item.visibility==='public'&&item.phase==='ready'&&item.players.size<4
              &&item.levelIndex===message.levelIndex&&item.difficulty===message.difficulty)
          } else if(message.type==='join') room=rooms.get(String(message.code||'').trim().toUpperCase())
          if(message.type==='join'&&!room)throw new Error('Room not found. Check the invite code.')
          if(room)joinRoom(room,client.id,message.name)
          else {
            if(rooms.size>=100)throw new Error('Server is full. Please try later.')
            room=createRoom(client.id,message.name,{...message,visibility:message.type==='quickJoin'?'public':message.visibility})
            rooms.set(room.id,room)
          }
          client.roomId=room.id;broadcastRoom(room);return
        }
        if(!room)throw new Error('Join a room first.')
        if(message.type==='start')startRoom(room,client.id)
        else if(message.type==='reset')resetRoom(room,client.id)
        else if(message.type==='pose'){updatePose(room,client.id,message.pose||{});return}
        else if(message.type==='action') {
          if(!applyAction(room,client.id,message.action||{}))return
        } else return
        broadcastRoom(room)
      } catch(error) {send(socket,{type:'error',message:error instanceof SyntaxError?'Invalid message.':error.message})}
    })
    socket.on('close',()=>{leave(client);clients.delete(client.id)})
  })
  let previous=Date.now()
  const tick=setInterval(()=>{
    const now=Date.now(),dt=(now-previous)/1000
    previous=now
    for(const room of rooms.values()) {tickRoom(room,dt);if(room.phase==='playing')broadcastRoom(room)}
    // Also publish the terminal state once the tick detects the group's result.
    for(const room of rooms.values())if(['won','lost'].includes(room.phase)&&!room.publishedResult){room.publishedResult=true;broadcastRoom(room)}
    for(const room of rooms.values())if(room.phase==='ready')room.publishedResult=false
  },100)
  const heartbeat=setInterval(()=>{
    for(const client of clients.values()) {
      if(!client.alive){client.socket.terminate();continue}
      client.alive=false;client.socket.ping()
    }
  },15000)
  server.listen(port,host)
  return {server,wss,rooms,close:()=>new Promise(resolve=>{
    clearInterval(tick);clearInterval(heartbeat)
    for(const client of clients.values())client.socket.terminate()
    wss.close(()=>server.close(resolve))
  })}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const port=Number(process.env.PORT)||8787
  createMultiplayerServer({port,host:process.env.HOST||'0.0.0.0',allowedOrigins:(process.env.ALLOWED_ORIGINS||'').split(',').map(origin=>origin.trim()).filter(Boolean)})
  console.log(`Maze multiplayer listening on port ${port}`)
}
