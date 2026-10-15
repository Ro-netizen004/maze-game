import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Golden Eye fits its pedestal, has a grounded origin and stays lightweight',async()=>{
  const bytes=await readFile(new URL('../public/models/golden-eye/golden-eye.glb',import.meta.url))
  assert.ok(bytes.length<512*1024)
  const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))
  let low=Infinity,high=-Infinity,triangles=0
  for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
    const bounds=gltf.accessors[primitive.attributes.POSITION]
    low=Math.min(low,bounds.min[1]);high=Math.max(high,bounds.max[1])
    for(const axis of [0,2])assert.ok(bounds.min[axis]>=-0.281&&bounds.max[axis]<=0.281)
    triangles+=gltf.accessors[primitive.indices].count/3
  }
  assert.ok(Math.abs(low)<0.0001);assert.ok(high<=0.561&&high>0.5)
  assert.ok(triangles<10000)
})

test('pendant, symbol and silver ring exports fit the pedestal and browser budget',async()=>{
  for(const name of ['eclipse-ember','watcher-ember','silver-ember']){
    const bytes=await readFile(new URL(`../public/models/${name}/${name}.glb`,import.meta.url))
    assert.ok(bytes.length<2*1024*1024,name+' file budget')
    const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))
    let low=Infinity,top=-Infinity,triangles=0
    for(const mesh of gltf.meshes)for(const p of mesh.primitives){
      const bounds=gltf.accessors[p.attributes.POSITION]
      low=Math.min(low,bounds.min[1]);top=Math.max(top,bounds.max[1])
      for(const axis of [0,2])assert.ok(bounds.min[axis]>=-0.276&&bounds.max[axis]<=0.276,name+' footprint')
      triangles+=gltf.accessors[p.indices].count/3
    }
    assert.ok(Math.abs(low)<0.001&&top<=0.551,name+' grounded height')
    assert.ok(triangles<16000,name+' triangle budget')
  }
})
