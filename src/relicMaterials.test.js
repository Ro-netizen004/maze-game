import test from 'node:test'
import assert from 'node:assert/strict'
import { BoxGeometry, Mesh, MeshStandardMaterial, Scene, Texture } from 'three'
import { prepareRelicModel, updateCandleFlames } from './quest/relicMaterials.js'

test('relic instances share geometry and textures but isolate materials and flame animation', () => {
  const scene = new Scene(), geometry = new BoxGeometry(), texture = new Texture()
  const sourceMaterial = new MeshStandardMaterial({ map: texture })
  const mesh = new Mesh(geometry, [sourceMaterial, sourceMaterial])
  mesh.name = 'flame_0'
  scene.add(mesh)
  const first = prepareRelicModel(scene, 'ritual-candle')
  const second = prepareRelicModel(scene, 'ritual-candle')
  assert.equal(first.model.children[0].geometry, geometry)
  assert.equal(first.materials[0].map, texture)
  assert.notEqual(first.materials[0], sourceMaterial)
  assert.notEqual(first.materials[0], second.materials[0])
  updateCandleFlames(first.flames, 1)
  assert.notEqual(first.materials[0].emissiveIntensity, second.materials[0].emissiveIntensity)
  assert.equal(sourceMaterial.emissiveIntensity, 1)
  const eye = prepareRelicModel(scene, 'watcher-eye')
  assert.equal(eye.materials[0].emissiveIntensity, 0.35)
  for (const instance of [first, second, eye]) instance.materials.forEach(material => material.dispose())
  geometry.dispose()
  texture.dispose()
  sourceMaterial.dispose()
})

test('bottle liquids and shells have isolated colours while gold and sources stay unchanged',()=>{
  const scene=new Scene(),geometry=new BoxGeometry()
  const liquid=new MeshStandardMaterial({color:'#3355aa'});liquid.name='Inside_Potion'
  const glass=new MeshStandardMaterial({color:'#aabbcc'});glass.name='Basic glass'
  const gold=new MeshStandardMaterial({color:'#cc9922'});gold.name='Fine Gold.001'
  scene.add(new Mesh(geometry,liquid),new Mesh(geometry,glass),new Mesh(geometry,gold))
  const colours=['#ffc65c','#79baff','#78e6a0','#bb7aff']
  const instances=colours.map(colour=>prepareRelicModel(scene,'moon-tear',colour))
  for(let i=0;i<instances.length;i++){
    assert.equal('#'+instances[i].materials[0].color.getHexString(),colours[i])
    assert.equal('#'+instances[i].materials[1].color.getHexString(),colours[i])
    assert.equal(instances[i].materials[2].color.getHex(),gold.color.getHex())
    assert.equal(instances[i].model.children[0].geometry,geometry)
    instances[i].materials.forEach(m=>m.dispose())
  }
  assert.equal(liquid.color.getHexString(),'3355aa')
  assert.equal(glass.color.getHexString(),'aabbcc')
  geometry.dispose();liquid.dispose();glass.dispose();gold.dispose()
})
