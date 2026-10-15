export default function CoopHud({ multiplayer, onLeave }) {
  const {room,id}=multiplayer
  const local=room.players.find(player=>player.id===id)
  const downed=room.players.filter(player=>player.downed)
  return <>
    <section aria-label="Co-op team" className="coop-team">
      <strong>CO-OP · {room.id} · {room.players.length}/4</strong>
      {room.players.map(player=><p key={player.id}>{player.name}{player.id===id?' (you)':''} · {player.escaped?'Escaped':player.downed?'Needs rescue':player.hidden?'Hidden':'Exploring'}</p>)}
    </section>
    {room.phase==='playing' && (local?.downed||local?.escaped) && <div className="coop-state" role="status">
      <h2>{local.downed?'You were caught':'You reached the exit'}</h2>
      <p>{local.downed?'A teammate can approach and press E to revive you.':'Waiting for the rest of your group to escape.'}</p>
      <button onClick={onLeave}>Leave co-op run</button>
    </div>}
    {room.phase==='playing'&&!local?.downed&&!local?.escaped&&downed.length>0&&<p className="coop-rescue" role="status">{downed.map(player=>player.name).join(', ')} needs rescue · Approach and press E</p>}
    {multiplayer.error && <p className="coop-rescue" role="alert">{multiplayer.error}</p>}
  </>
}
