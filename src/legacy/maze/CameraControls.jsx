import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default function CameraControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef(null)

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enableDamping = true
    controls.minDistance = 5
    controls.maxDistance = 60
    // Keep the camera above the floor.
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.target.set(0, 0, 0)
    controls.update()
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl])

  // Damping needs an update on every rendered frame.
  useFrame(() => controlsRef.current?.update())

  return null
}
