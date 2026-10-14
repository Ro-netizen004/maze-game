import { useRef } from 'react'
import { useFrame,useThree } from '@react-three/fiber'

// Every post glows; only the nearest posts need real lights. No cube shadows.
export default function LanternLights({fixtures,mobile,color,power=1}) {
  const lights=useRef([]), elapsed=useRef(1)
  const {camera}=useThree()
  useFrame((_,dt)=>{
    elapsed.current+=dt
    if(elapsed.current<0.2)return
    elapsed.current=0
    const nearest=fixtures.map(f=>({...f,distance:Math.hypot(f.position[0]-camera.position.x,f.position[2]-camera.position.z)})).sort((a,b)=>a.distance-b.distance)
    lights.current.forEach((light,index)=>{
      if(!light)return
      const fixture=nearest[index]
      light.visible=Boolean(fixture && fixture.distance<9)
      if(fixture)light.position.set(fixture.position[0],2.05,fixture.position[2])
      if(fixture)light.color.set(fixture.color||color)
    })
  })
  return Array.from({length:mobile?3:5},(_,index)=><pointLight key={index} ref={node=>{lights.current[index]=node}} color={color} intensity={9*power} distance={6} decay={2} />)
}
