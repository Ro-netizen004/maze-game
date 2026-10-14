import { useEffect, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createCustomMonsterRig } from './customMonsterRig.js'

export default function AnimatedMonster({ ai, active }) {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/custom-stalker/monster.glb`)
  const container = useRef(null)
  const rig = useRef(null)
  useEffect(() => {
    const creature = createCustomMonsterRig(gltf.scene)
    const parent = container.current
    parent.add(creature.group)
    rig.current = creature
    return () => { parent.remove(creature.group); creature.dispose(); rig.current = null }
  }, [gltf.scene])
  useFrame((_, delta) => {
    if (active) rig.current?.update(Math.min(delta, 0.05), ai.current.moving, ai.current.chasing, ai.current.attacking)
  })
  return <group ref={container} />
}
