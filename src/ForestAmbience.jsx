import { useEffect, useRef } from 'react'

export default function ForestAmbience({ active, enabled, volume, audioRef }) {
  const intent=useRef(false)
  useEffect(()=>{
    const audio=audioRef.current
    intent.current=active && enabled
    audio.volume=volume/100
    const sync=()=>{
      if(intent.current && !document.hidden) {
        audio.play().then(()=>{if(!intent.current || document.hidden) audio.pause()}).catch(()=>{})
      } else audio.pause()
    }
    sync()
    document.addEventListener('visibilitychange',sync)
    return ()=>{intent.current=false;audio.pause();document.removeEventListener('visibilitychange',sync)}
  },[active,enabled,volume,audioRef])
  return <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/forest-ambience.mp3`} loop preload="none" />
}
