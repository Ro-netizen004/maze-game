import { currentRitual } from './coopQuest.js'

export default function CoopHud({ multiplayer, onLeave, level }) {
  const {room,id}=multiplayer
  const local=room.players.find(player=>player.id===id)
  const downed=room.players.filter(player=>player.downed)
  const shrine=currentRitual(level,room.quest)
  return <>
    <section aria-label="Co-op team" className="coop-team">
      <strong>CO-OP · {room.id} · {room.players.length}/4</strong>
      {room.players.map(player=><p key={player.id}>{player.name}{player.id===id?' (you)':''} · {player.escaped?'Escaped':player.downed?'Needs rescue':player.hidden?'Hidden':'Exploring'}</p>)}
      {shrine&&<div className="mt-3 border-t border-white/20 pt-2"><strong>{shrine.name} deliveries</strong>{level.offerings.filter(item=>item.rune===shrine.id).map(item=>{
        const carrier=room.players.find(p=>p.id===room.quest.carriers[item.id])
        const state=room.quest.depositedOfferings.includes(item.id)?'Placed':carrier?`Carried by ${carrier.name}`:room.quest.droppedOfferings[item.id]?'Dropped — recover on trail':`Search ${item.hint}`
        return <p key={item.id}>{item.name} · {state}</p>
      })}</div>}
    </section>
    {room.phase==='playing' && (local?.downed||local?.escaped) && <div className="coop-state" role="status">
      <h2>{local.downed?'You were caught':'You reached the exit'}</h2>
      <p>{local.downed?'A teammate can approach and press E to revive you.':'Waiting for the rest of your group to escape.'}</p>
      {local.downed&&<><p>Your relics dropped where you were caught.</p><button disabled={local.respawnRemaining>0} onClick={()=>multiplayer.send({type:'action',action:{type:'respawn'}})}>{local.respawnRemaining>0?`Respawn in ${Math.ceil(local.respawnRemaining)}s`:'Respawn at entrance'}</button><p>Respawning grants 5 seconds of protection.</p></>}
      <button onClick={onLeave}>Leave co-op run</button>
    </div>}
    {room.phase==='playing'&&!local?.downed&&!local?.escaped&&downed.length>0&&<p className="coop-rescue" role="status">{downed.map(player=>player.name).join(', ')} needs rescue · Approach and press E</p>}
    {multiplayer.error && <p className="coop-rescue" role="alert">{multiplayer.error}</p>}
  </>
}
