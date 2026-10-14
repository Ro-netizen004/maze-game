import { useEffect, useImperativeHandle, useRef } from 'react'

export default function GuardianAudio({controllerRef,active,enabled,volume,proximity}) {
  const audioRef=useRef(null),intent=useRef(false)
  const audible=active && enabled && proximity>0
  useImperativeHandle(controllerRef,()=>({
    unlock() {
      const audio=audioRef.current
      audio.muted=true
      audio.play().then(()=>{
        audio.muted=false
        if(!intent.current || document.hidden) audio.pause()
      }).catch(()=>{audio.muted=false})
    },
  }),[])
  useEffect(()=>{
    audioRef.current.volume=Math.max(0,Math.min(1,volume/100*proximity/10))
  },[volume,proximity])
  useEffect(()=>{
    const audio=audioRef.current
    intent.current=audible
    const sync=()=>{
      if(intent.current && !document.hidden) {
        audio.play().then(()=>{if(!intent.current || document.hidden)audio.pause()}).catch(()=>{})
      } else audio.pause()
    }
    sync()
    document.addEventListener('visibilitychange',sync)
    return ()=>{intent.current=false;audio.pause();document.removeEventListener('visibilitychange',sync)}
  },[audible])
  return <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/demonic-whisper.mp3`} loop preload="none" />
}
