import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { createDeepSeaCreature } from './deepSeaCreature'

export default function DeepSeaMonster({ ai, active }) {
  const container = useRef(null)
  const creature = useRef(null)
  useEffect(() => {
    const model = createDeepSeaCreature()
    const parent = container.current
    parent.add(model.group)
    creature.current = model
    return () => {
      parent.remove(model.group)
      model.dispose()
      creature.current = null
    }
  }, [])
  useFrame((_, delta) => {
    const playing = active
    // Breathing and lure sway continue even when the creature stops walking.
    creature.current?.update(
      Math.min(delta, 0.05),
      playing && ai.current.moving,
      playing && ai.current.chasing,
      ai.current.attacking,
    )
  })
  return <group ref={container} />
}
