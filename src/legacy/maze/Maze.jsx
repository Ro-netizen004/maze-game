import { cellSize } from '../../game/world/levels.js'
import { useEffect, useMemo } from 'react'
import { createTexture } from '../../game/environment/textures.js'
import Wall from './Wall.jsx'
import Landmarks from '../../game/environment/Landmarks.jsx'

export default function Maze({ level }) {
  const maze = level.grid
  const width = maze[0].length * cellSize
  const depth = maze.length * cellSize
  const textures = useMemo(() => {
    const wall = createTexture(level.theme === 'timber' ? 'wood' : 'brick')
    const floor = createTexture(level.theme === 'timber' ? 'wood' : 'tile')
    floor.repeat.set(width / 4, depth / 4)
    return { wall, floor }
  }, [width, depth, level.theme])
  useEffect(() => () => {
    textures.wall.dispose()
    textures.floor.dispose()
  }, [textures])
  return (
    <group>
      <Landmarks level={level} />
      {/* A box gives the floor a little thickness. Its top is at y = 0. */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial map={textures.floor} bumpMap={textures.floor} bumpScale={0.025} color={level.theme === 'temple' ? '#9799ae' : '#b6b5a6'} roughness={0.48} metalness={0.08} />
      </mesh>
      {/* Thin damp patches catch the beam without adding reflection passes. */}
      {maze.flatMap((row, r) => row.map((cell, c) => {
        if (cell !== 0 || (r * 7 + c * 11) % 6 !== 0) return null
        return <mesh key={`dew-${r}-${c}`} position={[c * cellSize - width / 2 + cellSize / 2, 0.008, r * cellSize - depth / 2 + cellSize / 2]}
          rotation={[-Math.PI / 2, 0, (r + c) * 0.7]} scale={[0.65, 0.3, 1]} receiveShadow>
          <circleGeometry args={[0.65, 20]} />
          <meshPhysicalMaterial color="#52676b" roughness={0.18} metalness={0.12} clearcoat={0.8} clearcoatRoughness={0.15} transparent opacity={0.25} depthWrite={false} />
        </mesh>
      }))}

      {maze.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          if (cell === 0 || level.doors.some(door => door.cell[0] === rowIndex && door.cell[1] === columnIndex)) return null

          // Center the grid around the world origin.
          const x = columnIndex * cellSize - width / 2 + cellSize / 2
          const z = rowIndex * cellSize - depth / 2 + cellSize / 2

          return (
            <Wall key={`${rowIndex}-${columnIndex}`} position={[x, 0, z]} theme={level.theme} color={level.color} texture={textures.wall} />
          )
        }),
      )}
      {/* Overhead arches in straight temple passages; clear of player jumps. */}
      {level.theme === 'temple' && maze.map((row, r) => row.map((cell, c) => {
        if (cell !== 0 || r % 3 !== 1 || c === 0 || r === 0) return null
        const northSouth = row[c - 1] === 1 && row[c + 1] === 1
        const eastWest = maze[r - 1]?.[c] === 1 && maze[r + 1]?.[c] === 1
        if (!northSouth && !eastWest) return null
        return (
          <group key={`arch-${r}-${c}`} position={[c * cellSize - width / 2 + cellSize / 2, 2.9, r * cellSize - depth / 2 + cellSize / 2]} rotation={[0, northSouth ? 0 : Math.PI / 2, 0]}>
            <mesh castShadow receiveShadow>
              <torusGeometry args={[1, 0.14, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#b1a4c8" roughness={0.75} />
            </mesh>
          </group>
        )
      }))}
      {[{ cell: level.start, color: '#22c55e' }, { cell: level.end, color: '#facc15' }].map(({ cell: [r, c], color }, i) => (
        <mesh key={i} position={[c * cellSize - width / 2 + cellSize / 2, 0.025, r * cellSize - depth / 2 + cellSize / 2]}>
          <boxGeometry args={[1.8, 0.05, 1.8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

