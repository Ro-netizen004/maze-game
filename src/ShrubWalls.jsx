import { useLayoutEffect, useMemo, useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { Group, InstancedMesh, Object3D } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export default function ShrubWalls({ tiles }) {
  const gltf=useLoader(GLTFLoader,`${import.meta.env.BASE_URL}models/shrub-tiles/shrubs.glb`)
  const container=useRef(null)
  const variants=useMemo(()=>['Small','Medium','Large'].map(name=>gltf.scene.getObjectByName('Shrub'+name)),[gltf.scene])
  useLayoutEffect(()=>{
    const parent=container.current, group=new Group(), materials=[]
    const transform=new Object3D()
    variants.forEach((variant,index)=>{
      if(!variant)throw new Error('Missing shrub tile variant')
      const items=tiles.filter((_,i)=>i%variants.length===index)
      if(!items.length)return
      variant.traverse(part=>{
        if(!part.isMesh)return
        const material=part.material.clone()
        material.transparent=false;material.alphaTest=0.35;material.depthWrite=true;material.roughness=0.95
        materials.push(material)
        const mesh=new InstancedMesh(part.geometry,material,items.length)
        mesh.castShadow=false;mesh.receiveShadow=true
        items.forEach((item,i)=>{
          transform.position.set(...item.position);transform.rotation.set(0,item.rotation,0);transform.scale.setScalar(1)
          transform.updateMatrix();mesh.setMatrixAt(i,transform.matrix)
        })
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();group.add(mesh)
      })
    })
    parent.add(group)
    return ()=>{
      parent.remove(group)
      group.traverse(obj=>{if(obj.isInstancedMesh)obj.dispose()})
      materials.forEach(mat=>mat.dispose())
    }
  },[tiles,variants])
  return <group ref={container} />
}
