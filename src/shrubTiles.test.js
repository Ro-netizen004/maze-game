import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('all three supplied shrub variants fit the maze walls and meet the floor', async () => {
  const bytes=await readFile(new URL('../public/models/shrub-tiles/shrubs.glb',import.meta.url))
  assert.ok(bytes.length<8*1024*1024,'serve the extracted pack, not the 56 MB showcase scene')
  const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)))
  for(const name of ['Small','Medium','Large']){
    const root=gltf.nodes.find(node=>node.name==='Shrub'+name)
    assert.ok(root && root.children.length===2)
    let bottom=Infinity,top=-Infinity,triangles=0
    for(const child of root.children){
      for(const primitive of gltf.meshes[gltf.nodes[child].mesh].primitives){
        const bounds=gltf.accessors[primitive.attributes.POSITION]
        bottom=Math.min(bottom,bounds.min[1]);top=Math.max(top,bounds.max[1])
        for(const axis of [0,2])assert.ok(bounds.min[axis]>=-1.0001 && bounds.max[axis]<=1.0001,'foliage must stay within the 2 m wall cell')
        triangles+=gltf.accessors[primitive.indices].count/3
      }
    }
    assert.ok(Math.abs(bottom)<0.0001,'tile base must be on the floor')
    assert.ok(Math.abs(top-2.4)<0.0001,'wall must be above player eye height')
    assert.ok(triangles<1000,'reuse lightweight geometry per variant')
  }
})
