import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import ForestRoad from '../game/environment/ForestRoad.jsx'
import '../index.css'
function Camera() {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.target.set(0, 1.5, 14)
    controls.update()
    return () => controls.dispose()
  }, [camera, gl])
  return null
}
export default function ForestRoadPreview() {
  return <div className="h-screen text-white"><Canvas camera={{ position: [0, 2.8, -3], fov: 65 }}>
    <color attach="background" args={['#10252b']} /><fog attach="fog" args={['#203536', 7, 40]} />
    <hemisphereLight intensity={1} args={['#b5d0d5', '#394834', 1]} />
    <directionalLight position={[8, 12, -4]} intensity={1.5} color="#acc6da" />
    <Camera /><Suspense fallback={null}><ForestRoad position={[0, 0, 0]} /></Suspense>
  </Canvas><div className="absolute left-4 top-4 rounded-xl bg-slate-950/90 p-4"><h1 className="font-bold">Escape forest road</h1><p className="text-sm">Drag to orbit · Scroll to zoom</p><p className="mt-2 text-xs">Forest road by dasy444 · CC BY 4.0</p></div></div>
}
