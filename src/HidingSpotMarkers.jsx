import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Object3D, SRGBColorSpace } from 'three'
import { cellPosition } from './levels'

function shelterTexture() {
  const canvas=document.createElement('canvas')
  canvas.width=256;canvas.height=160
  const ctx=canvas.getContext('2d')
  ctx.fillStyle='#172922';ctx.fillRect(0,0,256,160)
  ctx.strokeStyle='#aec5a2';ctx.lineWidth=3;ctx.strokeRect(9,9,238,142)
  // A crouching figure behind cover: the same symbol on every shelter.
  ctx.fillStyle='#e0ead0';ctx.beginPath();ctx.arc(119,35,10,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#e0ead0';ctx.lineWidth=9;ctx.lineCap='round';ctx.lineJoin='round'
  ctx.beginPath();ctx.moveTo(115,53);ctx.lineTo(101,73);ctx.lineTo(126,78);ctx.lineTo(144,94)
  ctx.moveTo(114,57);ctx.lineTo(139,68);ctx.moveTo(102,75);ctx.lineTo(90,94);ctx.lineTo(113,94);ctx.stroke()
  ctx.fillStyle='#aec5a2';ctx.fillRect(160,39,10,63);ctx.fillRect(153,96,27,6)
  ctx.fillStyle='#e0ead0';ctx.font='bold 25px sans-serif';ctx.textAlign='center';ctx.fillText('HIDE',128,135)
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace
  return texture
}

function HidingSpotMarkers({ level }) {
  const texture=useMemo(()=>shelterTexture(),[])
  const posts=useRef(null),backs=useRef(null),faces=useRef(null)
  useEffect(()=>()=>texture.dispose(),[texture])
  useLayoutEffect(()=>{
    const transform=new Object3D()
    level.hidingSpots.forEach((spot,index)=>{
    const [x,z]=cellPosition(level,spot.cell)
    const entry=spot.entryCell || [[-1,0],[1,0],[0,-1],[0,1]].map(([dr,dc])=>[spot.cell[0]+dr,spot.cell[1]+dc]).find(([r,c])=>level.grid[r]?.[c]===0) || spot.cell
    const [ex,ez]=cellPosition(level,entry)
    const distance=Math.hypot(ex-x,ez-z)||1, nx=(ex-x)/distance,nz=(ez-z)/distance
    // At the side of the pocket's mouth, outside its traversable center.
      const px=x+nx*0.82+nz*0.68,pz=z+nz*0.82-nx*0.68
      transform.rotation.set(0,Math.atan2(nx,nz),0)
      for(const [ref,height,offset] of [[posts,0.54,0],[backs,1.04,0],[faces,1.04,0.019]]) {
        transform.position.set(px+nx*offset,height,pz+nz*offset);transform.updateMatrix()
        ref.current.setMatrixAt(index,transform.matrix)
      }
    })
    for(const ref of [posts,backs,faces]) {ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere()}
  },[level])
  const count=level.hidingSpots.length
  return <group>
    <instancedMesh ref={posts} args={[null,null,count]}><cylinderGeometry args={[0.025,0.035,1.08,5]} /><meshStandardMaterial color="#61583f" roughness={1} /></instancedMesh>
    <instancedMesh ref={backs} args={[null,null,count]}><boxGeometry args={[0.67,0.43,0.035]} /><meshStandardMaterial color="#61583f" roughness={1} /></instancedMesh>
    <instancedMesh ref={faces} args={[null,null,count]}><planeGeometry args={[0.64,0.4]} /><meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.45} roughness={1} /></instancedMesh>
  </group>
}

export default memo(HidingSpotMarkers)
