import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import AnimatedMonster from '../game/guardian/AnimatedMonster.jsx'
import '../index.css'

function Camera() {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.target.set(0, 1.25, 0)
    controls.update()
    return () => controls.dispose()
  }, [camera, gl])
  return null
}
export default function Preview() {
  const ai = useRef({ moving: true, chasing: false, attacking: false })
  const [mode, setMode] = useState('Walk')
  function choose(value) {
    ai.current = { moving: value === 'Walk' || value === 'Run', chasing: value === 'Run', attacking: value === 'Attack' }
    setMode(value)
  }
  return <div className="h-screen text-white">
    <Canvas camera={{ position: [3, 2.2, 4], fov: 42 }} shadows>
      <color attach="background" args={['#101c25']} />
      <hemisphereLight args={['#c4e4ef', '#37463b', 1.4]} />
      <directionalLight position={[3, 5, 4]} intensity={3} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={2} color="#57cdd6" />
      <Camera />
      <Suspense fallback={null}><AnimatedMonster ai={ai} active /></Suspense>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#20353b" roughness={0.55} /></mesh>
    </Canvas>
    <div className="absolute left-4 top-4 rounded-xl border border-white/20 bg-slate-950/90 p-4">
      <h1 className="text-xl font-bold">Deep-sea stalker · {mode}</h1><p className="mt-1 text-sm text-slate-300">Drag to orbit · Scroll to zoom</p>
      <div className="mt-3 flex gap-2">{['Idle', 'Walk', 'Run', 'Attack'].map(value => <button key={value} onClick={() => choose(value)} className={`rounded px-3 py-2 ${mode === value ? 'bg-cyan-700' : 'bg-slate-700'}`}>{value}</button>)}</div>
    </div>
  </div>
}
