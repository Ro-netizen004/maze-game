import { useState } from 'react'

export default function MultiplayerLobby({ multiplayer,levelIndex,difficulty }) {
  const [endpoint,setEndpoint]=useState(import.meta.env.VITE_MULTIPLAYER_URL||(import.meta.env.DEV?'ws://127.0.0.1:8787':''))
  const [name,setName]=useState('Explorer')
  const [code,setCode]=useState('')
  const {room,connection,error,id}=multiplayer
  const connected=connection==='connected'
  const send=(type,extra={})=>multiplayer.send({type,name,levelIndex,difficulty,...extra})
  return <div className="multiplayer-lobby">
    <p>Explore together with up to 4 players. Relics, seals and runes are shared. Rescue fallen teammates and escape as a group.</p>
    {!connected && <form onSubmit={event=>{event.preventDefault();multiplayer.connect(endpoint)}}>
      <label htmlFor="server-url">Multiplayer server</label>
      <input id="server-url" value={endpoint} onChange={event=>setEndpoint(event.target.value)} placeholder="wss://your-server.example" required />
      <button disabled={connection==='connecting'}>{connection==='connecting'?'Connecting…':'Connect to server'}</button>
      <small>The server runs separately from this website.</small>
    </form>}
    {connected && !room && <>
      <label htmlFor="explorer-name">Your name</label><input id="explorer-name" maxLength={20} value={name} onChange={event=>setName(event.target.value)} />
      <div className="multiplayer-actions"><button onClick={()=>send('create',{visibility:'private'})}>Create private room</button><button onClick={()=>send('create',{visibility:'public'})}>Create public room</button><button onClick={()=>send('quickJoin')}>Quick join public</button></div>
      <form onSubmit={event=>{event.preventDefault();send('join',{code})}}><label htmlFor="room-code">Invite code</label><div className="multiplayer-actions"><input id="room-code" maxLength={6} value={code} onChange={event=>setCode(event.target.value.toUpperCase())} placeholder="ABC123" required /><button>Join room</button></div></form>
      <div className="multiplayer-actions"><h3>Public rooms</h3><button onClick={()=>send('list')}>Refresh rooms</button></div>
      {multiplayer.rooms.length ? <ul>{multiplayer.rooms.map(item=><li key={item.id}><span>{item.id} · Maze {item.levelIndex+1} · {item.difficulty} · {item.count}/4</span><button onClick={()=>send('join',{code:item.id})}>Join {item.id}</button></li>)}</ul> : <p>No open public rooms. Quick join creates one if needed.</p>}
    </>}
    {room && <>
      <h3>{room.visibility==='private'?'Private':'Public'} room · <strong>{room.id}</strong></h3>
      <p>Share this invite code with your friends.</p>
      <ul>{room.players.map(player=><li key={player.id}>{player.name}{player.id===id?' (you)':''}{player.id===room.ownerId?' · Host':''}</li>)}</ul>
      <p>{room.players.length<2?'Waiting for another player…':room.ownerId===id?'Your group is ready.':'Waiting for the host to start…'}</p>
      {room.ownerId===id && <button disabled={room.players.length<2} onClick={()=>send('start')}>Start co-op run</button>}
      <button onClick={()=>send('leave')}>Leave room</button>
    </>}
    {connected && !room && <button onClick={multiplayer.disconnect}>Disconnect</button>}
    {error && <p className="multiplayer-error" role="alert">{error}</p>}
  </div>
}
