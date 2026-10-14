import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import PlayerAvatar from '../game/player/PlayerAvatar.jsx'
import '../index.css'

function Camera() {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.target.set(0, 0.9, 0)
    controls.update()
    return () => controls.dispose()
  }, [camera, gl])
  return null
}
export default function AvatarPreview() {
  const pose = useRef({ x: 0, y: 0, z: 0, yaw: 0, moving: false, sprinting: false })
  const [mode, setMode] = useState('Idle')
  function choose(value) {
    pose.current.moving = value !== 'Idle'
    pose.current.sprinting = value === 'Run'
    setMode(value)
  }
  return <div className="h-screen text-white">
    <Canvas camera={{ position: [2.4, 1.8, 3.4], fov: 42 }} shadows>
      <color attach="background" args={['#162c30']} />
      <hemisphereLight intensity={1.8} /><directionalLight position={[3, 5, 4]} intensity={2} castShadow />
      <Camera /><PlayerAvatar pose={pose} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#365553" /></mesh>
    </Canvas>
    <div className="absolute left-4 top-4 rounded-xl bg-slate-950/90 p-4"><h1 className="text-xl font-bold">Blocky player · {mode}</h1>
      <p className="mt-1 text-sm">Drag to orbit · Scroll to zoom</p>
      <div className="mt-3 flex gap-2">{['Idle', 'Walk', 'Run'].map(value => <button key={value} onClick={() => choose(value)} className={`rounded px-3 py-2 ${mode === value ? 'bg-teal-700' : 'bg-slate-700'}`}>{value}</button>)}</div>
    </div>
  </div>
}
