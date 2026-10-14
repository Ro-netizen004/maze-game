import { Suspense, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import AssetBoundary from '../rendering/AssetBoundary.jsx'
import Landmarks from './Landmarks.jsx'
import StatueCircle from './StatueCircle.jsx'

function AuthoredMaze() {
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}models/longleat-maze/maze.glb`)
  const model = useMemo(() => {
    const scene = gltf.scene.clone(true)
    scene.traverse(node => {
      if (node.isMesh) { node.castShadow = false; node.receiveShadow = true }
    })
    return scene
  }, [gltf.scene])
  return <primitive object={model} dispose={null} />
}

export default function LongleatMaze({ level }) {
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.03,0]}>
      <planeGeometry args={[level.movementBounds.right-level.movementBounds.left+4,level.movementBounds.back-level.movementBounds.front+4]} />
      <meshStandardMaterial color="#4d5640" roughness={1} />
    </mesh>
    <AssetBoundary fallback={null}><Suspense fallback={null}><AuthoredMaze /></Suspense></AssetBoundary>
    <StatueCircle radius={3.5} />
    <Landmarks level={level} forest />
    {level.clearings.map(clearing => <mesh key={clearing.id} position={[clearing.position[0], 0.012, clearing.position[1]]} rotation={[-Math.PI/2,0,0]}>
      <circleGeometry args={[clearing.radius - 0.2,64]} />
      <meshStandardMaterial color="#7a7764" roughness={1} />
    </mesh>)}
  </group>
}
