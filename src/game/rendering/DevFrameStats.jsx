import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Opt-in local profiling only; production builds do not mount this component.
export default function DevFrameStats() {
  const sample = useRef({ frames: 0, time: 0, calls: 0, triangles: 0 })
  useFrame(({ gl }, delta) => {
    const current = sample.current
    current.frames++
    current.time += delta
    current.calls += gl.info.render.calls
    current.triangles += gl.info.render.triangles
    if (current.frames === 120) {
      console.info('Forest frame sample', JSON.stringify({ fps: Math.round(current.frames / current.time), calls: Math.round(current.calls / current.frames), triangles: Math.round(current.triangles / current.frames), geometries: gl.info.memory.geometries, textures: gl.info.memory.textures }))
      sample.current = { frames: 0, time: 0, calls: 0, triangles: 0 }
    }
  })
  return null
}
