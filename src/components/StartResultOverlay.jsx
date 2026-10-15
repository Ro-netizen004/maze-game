import { useEffect, useRef, useState } from 'react'
import MultiplayerLobby from '../multiplayer/MultiplayerLobby.jsx'
import SettingsPanel from './SettingsPanel'
import AssetCredits from './AssetCredits'
import { bestTimeKey } from '../persistence'
import { formatTime } from '../runTimer'

export default function StartResultOverlay({ status, level, levelIndex, levels, unlockedLevel, difficulty, bestTimes, elapsed,
  settings, onSettings, onReset, onDifficulty, onChooseLevel, onStart, onNext, onRestart, mode, onMode, multiplayer }) {
  const heading=useRef(null)
  const [panel,setPanel]=useState(null)
  useEffect(()=>heading.current?.focus(),[status])
  useEffect(()=>{
    const close=event=>{if(event.key==='Escape')setPanel(null)}
    window.addEventListener('keydown',close)
    return ()=>window.removeEventListener('keydown',close)
  },[])
  const ready=status==='ready'
  const titles={settings:'Settings',guide:'How to play',times:'Best times',credits:'Asset credits',multiplayer:'Multiplayer rooms'}
  return <div className="forest-menu maze-lobby" role="dialog" aria-modal="true" aria-labelledby="game-dialog-title">
    <header className="lobby-bar">
      <span className="lobby-status"><span className="lobby-dot" /> {mode==='multiplayer'?'CO-OP SURVIVAL':'SOLO SURVIVAL'} <span className="lobby-divider">/</span> MAZE {levelIndex+1} OF {levels.length}</span>
      <button onClick={()=>setPanel('settings')} aria-label="Open settings">Settings <span aria-hidden="true">⚙</span></button>
    </header>
    <div className="lobby-brand"><span className="lobby-eyebrow">AFTER DARK</span><h1 id="game-dialog-title" tabIndex="-1" ref={heading}>THE MAZE</h1><span className="lobby-brand-rule" /> <p>A way out. Something watching.</p></div>
    <nav className="lobby-nav" aria-label="Game menu">
      <p className="lobby-eyebrow">EXPLORE THE FOREST</p>
      {['guide','times','settings','credits'].map((id,i)=><button key={id} onClick={()=>setPanel(id)}><span className="lobby-nav-number">0{i+1}</span>{titles[id]}<span className="lobby-nav-arrow" aria-hidden="true">↗</span></button>)}
    </nav>
    <main className="lobby-center">
      <p className="lobby-eyebrow">{ready ? 'THE FOREST IS WAITING' : status==='won' ? 'BEYOND THE TREELINE' : 'LOST IN THE WOODS'}</p>
      {ready ? <button className="lobby-play" disabled={mode==='multiplayer' && (!multiplayer.room || multiplayer.room.ownerId!==multiplayer.id || multiplayer.room.players.length<2)} onClick={onStart}>{mode==='multiplayer' ? multiplayer.room?.ownerId===multiplayer.id ? 'START CO-OP' : 'WAITING FOR HOST' : 'CLICK TO PLAY'} <span aria-hidden="true">▶</span></button> : <>
        <h2 className="lobby-result">{status==='won'?'YOU ESCAPED':'THE GUARDIAN CAUGHT YOU'}</h2>
        <p>{mode==='multiplayer' ? status==='won' ? 'Your group escaped together.' : 'The group was caught. Rescue teammates on the next run.' : status==='won' ? 'Escaped in '+formatTime(elapsed)+'. Best: '+formatTime(bestTimes[bestTimeKey(level.id,difficulty)]) : 'Use turns and hedge pockets to escape the guardian.'}</p>
        <div className="lobby-result-actions">{mode==='solo' && status==='won' && levelIndex<levels.length-1 && <button onClick={onNext}>Next maze</button>}<button onClick={onRestart}>Play again / Menu</button></div>
      </>}
      <p className="lobby-center-note">{level.name} <span>·</span> {difficulty.toUpperCase()}</p>
    </main>
    <aside className="lobby-setup" aria-label="Run setup">
      <p className="lobby-eyebrow">YOUR NEXT RUN</p>
      <div className="mode-switch" aria-label="Game mode"><button aria-pressed={mode==='solo'} disabled={!ready} onClick={()=>onMode('solo')}>Solo</button><button aria-pressed={mode==='multiplayer'} disabled={!ready} onClick={()=>{onMode('multiplayer');setPanel('multiplayer')}}>Multiplayer</button></div>
      {mode==='multiplayer' && <><button className="rooms-button" onClick={()=>setPanel('multiplayer')}>Rooms / Invite friends</button><p className="text-xs">{multiplayer.room ? 'Room '+multiplayer.room.id+' · '+multiplayer.room.players.length+'/4 players' : 'Join or create a room to play.'}</p></>}
      <h2>{level.name}</h2>
      <label htmlFor="level">Choose a maze</label>
      <select id="level" value={levelIndex} disabled={!ready || Boolean(multiplayer.room)} onChange={event=>onChooseLevel(Number(event.target.value))}>{levels.map((item,index)=><option key={item.id} value={index} disabled={index>unlockedLevel}>{item.name}{index>unlockedLevel?' — Locked':''}</option>)}</select>
      <label htmlFor="difficulty">Difficulty</label>
      <select id="difficulty" value={difficulty} disabled={!ready || Boolean(multiplayer.room)} onChange={event=>onDifficulty(event.target.value)}><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select>
      <div className="lobby-objective"><span>THE OBJECTIVE</span><p>Keys awaken the seals.<br />Offerings light the runes.</p><small>Dawn + Moon → Watcher → Escape.</small></div>
      <p className="lobby-personal-best">BEST TIME <strong>{formatTime(bestTimes[bestTimeKey(level.id,difficulty)])}</strong></p>
    </aside>
    <footer className="lobby-footer"><span>WASD <small>MOVE</small> <b>·</b> SHIFT <small>SPRINT</small> <b>·</b> E <small>INTERACT / HIDE</small> <b>·</b> F <small>FLASHLIGHT</small></span><span>CLICK OR DRAG TO LOOK <b>·</b> ESC TO PAUSE</span></footer>
    {panel && <div className="lobby-sheet-backdrop" onClick={()=>setPanel(null)}><section className="lobby-sheet" aria-label={titles[panel]} onClick={event=>event.stopPropagation()}>
      <header><h2>{titles[panel]}</h2><button autoFocus onClick={()=>setPanel(null)} aria-label="Close panel">✕</button></header>
      {panel==='multiplayer' && <MultiplayerLobby multiplayer={multiplayer} levelIndex={levelIndex} difficulty={difficulty} />}
      {panel==='settings' && <SettingsPanel settings={settings} onChange={onSettings} onReset={onReset} />}
      {panel==='guide' && <div className="lobby-guide"><p>Open Ruby’s seal to awaken Dawn in Sunwell Clearing, and Sapphire’s seal to awaken Moon in Moonwell Clearing. Collect Sun Ember, then its Dawn Candle, and bring both to Dawn. Next find Moon Tear and its Moon Candle to light Moon. Both runes release the Watcher’s Eye and then the Watcher Candle for the final ritual in the Watcher’s Court. Only the next relic appears as its previous quest step is completed. Complete all three rituals to release the Old Road exit. Follow the sun, crescent and eye signs to their clearings and use E to interact.</p><p>WASD to move · Shift to sprint · Space to jump · E to collect, activate, open or hide · F to toggle the flashlight · Escape to pause.</p><p>Look for the green HIDE signs with a crouching figure. They mark usable shelters, including the pocket just behind the entrance. Step inside and press E to hide; press E again to leave. Click or drag to look, save stamina, and use turns to break the guardian’s sight. At 45 seconds the lightposts flicker, then go dark for 12 seconds. Your flashlight still works, but aiming it at the guardian reveals you even in a hiding spot. Turn it away or off before hiding. Hard mode’s guardian outruns walking and searches longer.</p></div>}
      {panel==='times' && <div className="lobby-times"><p>{difficulty.toUpperCase()} DIFFICULTY</p>{levels.slice(0,unlockedLevel+1).map(item=><p key={item.id}><span>{item.name}</span><strong>{formatTime(bestTimes[bestTimeKey(item.id,difficulty)])}</strong></p>)}</div>}
      {panel==='credits' && <AssetCredits />}
    </section></div>}
  </div>
}
