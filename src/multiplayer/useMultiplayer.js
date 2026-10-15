import { useCallback, useEffect, useRef, useState } from 'react'

export default function useMultiplayer(onRound) {
  const socketRef=useRef(null)
  const roundRef=useRef(null),onRoundRef=useRef(onRound)
  useEffect(()=>{onRoundRef.current=onRound},[onRound])
  const [connection,setConnection]=useState('offline')
  const [room,setRoom]=useState(null)
  const [rooms,setRooms]=useState([])
  const [id,setId]=useState(null)
  const [error,setError]=useState('')
  const send=useCallback(message=>{
    if(socketRef.current?.readyState!==WebSocket.OPEN)return false
    socketRef.current.send(JSON.stringify(message));return true
  },[])
  const disconnect=useCallback(()=>{
    if(socketRef.current){
      socketRef.current.onclose=null;socketRef.current.onmessage=null
      socketRef.current.onerror=null;socketRef.current.onopen=null
      socketRef.current.close();socketRef.current=null
    }
    roundRef.current=null
    setRoom(null);setRooms([]);setId(null);setConnection('offline');setError('')
  },[])
  const connect=useCallback(endpoint=>{
    try {
      const url=new URL(endpoint)
      if(!['ws:','wss:'].includes(url.protocol))throw new Error('Use a ws:// or wss:// server URL.')
      if(location.protocol==='https:'&&url.protocol!=='wss:')throw new Error('The live site needs a secure wss:// server URL.')
      disconnect();setConnection('connecting')
      const socket=new WebSocket(url)
      socketRef.current=socket
      const timeout=setTimeout(()=>{if(socket.readyState!==WebSocket.OPEN)socket.close()},10000)
      socket.onopen=()=>{clearTimeout(timeout);setConnection('connected');socket.send(JSON.stringify({type:'list'}))}
      socket.onmessage=event=>{
        let message
        try{message=JSON.parse(event.data)}catch{return}
        if(message.type==='welcome')setId(message.id)
        if(message.type==='room'){
          if(roundRef.current!==message.room.seed){roundRef.current=message.room.seed;onRoundRef.current?.()}
          setRoom(message.room);setError('')
        }
        if(message.type==='rooms')setRooms(message.rooms)
        if(message.type==='left'){roundRef.current=null;setRoom(null)}
        if(message.type==='error')setError(message.message)
      }
      socket.onerror=()=>setError('Cannot reach the multiplayer server. Check the URL and that the server is running.')
      socket.onclose=()=>{clearTimeout(timeout);setConnection('offline');setRoom(null);setId(null);setError('Connection closed. Reconnect to join a lobby.')}
    }catch(error){setError(error.message);setConnection('offline')}
  },[disconnect])
  useEffect(()=>()=>{
    if(socketRef.current){socketRef.current.onclose=null;socketRef.current.onmessage=null;socketRef.current.close()}
  },[])
  return {id,connection,room,rooms,error,connect,disconnect,send}
}
